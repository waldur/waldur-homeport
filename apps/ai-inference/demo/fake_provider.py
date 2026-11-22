#!/usr/bin/env python3
"""Plays the site agent of the demo inference offerings on a local dev stack.

It does through Waldur's provider API what waldur-site-agent's LiteLLM plugin
does, without a gateway behind it:

- approves orders for the demo offerings, then finishes them: the new
  service gets its backend ID and an OpenAI-compatible endpoint;
- carries out key commands: a requested or rotated key gets a made-up value
  (set_key), a pause, resume or settings change is acknowledged, a deleted
  key is reported deleted;
- reports usage for active keys every few ticks, so the meters fill and a
  key pauses when it reaches a limit (Waldur issues the pause, this script
  acknowledges it).

Nothing answers at the endpoints, so "Try it" gets no reply.

    WALDUR_PASSWORD=<the provider user's password from seed.py> \
      python3 fake_provider.py

It signs in as WALDUR_USERNAME (default "provider") and signs in again when
the token expires. WALDUR_TOKEN instead uses that token as it is, until it
expires. Standard library only. WALDUR_API_URL defaults to
http://localhost:10780/api/.
"""

import datetime
import json
import os
import random
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = os.environ.get("WALDUR_API_URL", "http://localhost:10780/api/").rstrip("/")
TOKEN = os.environ.get("WALDUR_TOKEN")
USERNAME = os.environ.get("WALDUR_USERNAME", "provider")
PASSWORD = os.environ.get("WALDUR_PASSWORD")
TICK = float(os.environ.get("FAKE_PROVIDER_TICK", "3"))
USAGE_EVERY = int(os.environ.get("FAKE_PROVIDER_USAGE_EVERY", "5"))

# The demo offerings this script answers for, and the endpoint each serves.
ENDPOINTS = {
    "CBorg API": "https://cborg.lbl.example/v1",
    "ALCF Inference Service": "https://inference.alcf.example/v1",
    "LivChat": "https://livchat.llnl.example/v1",
}


def sign_in():
    """A fresh token for USERNAME, from the password login next to the API."""
    global TOKEN
    root = API[: -len("/api")] if API.endswith("/api") else API
    request = urllib.request.Request(
        f"{root}/api-auth/password/",
        method="POST",
        data=json.dumps({"username": USERNAME, "password": PASSWORD}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        TOKEN = json.loads(response.read())["token"]
    log(f"signed in as {USERNAME}")


def call(method, path, body=None, query=None, retried=False):
    url = f"{API}/{path.strip('/')}/"
    if query:
        url += "?" + urllib.parse.urlencode(query, doseq=True)
    request = urllib.request.Request(
        url,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "Authorization": f"Token {TOKEN}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read()
            return json.loads(payload) if payload else None
    except urllib.error.HTTPError as error:
        # Tokens expire: sign in again and repeat the call, once.
        if error.code == 401 and PASSWORD and not retried:
            try:
                sign_in()
            except (OSError, ValueError, KeyError) as failure:
                log(f"could not sign in again: {failure}")
                return None
            return call(method, path, body, query, retried=True)
        detail = error.read().decode(errors="replace")[:300]
        log(f"{method} {path} → {error.code} {detail}")
        return None
    except (OSError, ValueError) as error:
        # The dev server restarting, a dropped connection, a half-written
        # answer: skip this call, the next tick tries again.
        log(f"{method} {path} → {error.__class__.__name__}: {error}")
        return None


def log(message):
    print(f"{datetime.datetime.now():%H:%M:%S} {message}", flush=True)


def demo_offerings():
    offerings = call(
        "GET",
        "marketplace-provider-offerings",
        query={"type": "Marketplace.SiteAgent", "page_size": 100},
    )
    return {o["uuid"]: o["name"] for o in offerings or [] if o["name"] in ENDPOINTS}


def handle_orders(offerings):
    for offering_uuid, offering_name in offerings.items():
        orders = call(
            "GET",
            "marketplace-orders",
            query={
                "offering_uuid": offering_uuid,
                "state": ["pending-provider", "executing"],
            },
        )
        for order in orders or []:
            uuid, name = order["uuid"], order.get("resource_name") or order["uuid"]
            # One step per tick, so the app shows each state on the way.
            if order["state"] == "pending-provider":
                call("POST", f"marketplace-orders/{uuid}/approve_by_provider")
                log(f"approved the {order['type']} order for {name}")
            elif order["state"] == "executing":
                if order["type"] == "Create":
                    backend_id = (order.get("resource_name") or uuid)[:40]
                    call(
                        "POST",
                        f"marketplace-orders/{uuid}/set_backend_id",
                        {"backend_id": backend_id},
                    )
                    call(
                        "POST",
                        f"marketplace-provider-resources/{order['marketplace_resource_uuid']}/set_endpoints",
                        {
                            "endpoints": [
                                {
                                    "name": "OpenAI-compatible API",
                                    "url": ENDPOINTS[offering_name],
                                }
                            ]
                        },
                    )
                call("POST", f"marketplace-orders/{uuid}/set_state_done")
                log(f"finished the {order['type']} order for {name}")


def handle_keys(offerings):
    for offering_uuid in offerings:
        keys = call(
            "GET",
            "marketplace-resource-api-keys",
            query={"offering_uuid": offering_uuid, "has_pending_action": "true"},
        )
        for key in keys or []:
            if key["state"] == "Erred":
                continue
            uuid, action = key["uuid"], key["pending_action"]
            label = key.get("description") or key.get("client_id") or uuid[:8]
            if action in ("create", "rotate"):
                body = {"api_key": f"sk-demo-{secrets.token_urlsafe(24)}"}
                if not key.get("client_id"):
                    body["client_id"] = f"{key['resource_backend_id']}-{uuid[:6]}"
                call("POST", f"marketplace-resource-api-keys/{uuid}/set_key", body)
            elif action == "pause":
                call("POST", f"marketplace-resource-api-keys/{uuid}/set_paused")
            elif action in ("resume", "update"):
                call("POST", f"marketplace-resource-api-keys/{uuid}/set_ok")
            elif action == "delete":
                call("POST", f"marketplace-resource-api-keys/{uuid}/set_deleted")
            else:
                continue
            log(f"{action}: {label}")


# What each active key has used today, as this script reported it. Today's
# amount replaces the one reported before, so it is kept here.
today_usage = {}


def report_usage(offerings):
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for offering_uuid in offerings:
        keys = call(
            "GET",
            "marketplace-resource-api-keys",
            query={"offering_uuid": offering_uuid, "state": ["OK"]},
        )
        for key in keys or []:
            used = today_usage.setdefault(
                (key["uuid"], today),
                {"token_cost": 0.0, "input_tokens": 0, "output_tokens": 0},
            )
            cost = round(random.uniform(0.1, 0.4), 2)
            used["token_cost"] = round(used["token_cost"] + cost, 2)
            used["input_tokens"] += int(cost * 400_000)
            used["output_tokens"] += int(cost * 120_000)
            call(
                "POST",
                f"marketplace-resource-api-keys/{key['uuid']}/report_usage",
                {
                    "daily_usages": [
                        {"type": kind, "date": today.isoformat(), "amount": amount}
                        for kind, amount in used.items()
                    ]
                },
            )
        if keys:
            log(f"reported usage of {len(keys)} active key(s)")
    report_service_usage(offerings)


# Key states whose usage this month counts towards the service's.
KEY_STATES_WITH_USAGE = ["OK", "Paused", "Updating", "Erred", "Deleting", "Deleted"]


def report_service_usage(offerings):
    """Each service's usage this month: the sum of its keys', as the LiteLLM
    plugin's reporting backend reports it per resource. It is what the
    portal's usage tab, the invoice and the service's own spending limits
    read; key reports alone leave them empty."""
    now = datetime.datetime.now(datetime.timezone.utc)
    today = now.date()
    month = now.strftime("%Y-%m-01")
    for offering_uuid in offerings:
        resources = call(
            "GET",
            "marketplace-provider-resources",
            query={"offering_uuid": offering_uuid, "state": ["OK"]},
        )
        keys = call(
            "GET",
            "marketplace-resource-api-keys",
            query={"offering_uuid": offering_uuid, "state": KEY_STATES_WITH_USAGE},
        )
        for resource in resources or []:
            totals, today_totals = {}, {}
            for key in keys or []:
                if key["resource_uuid"] != resource["uuid"]:
                    continue
                if (key.get("usage_period") or "") != month:
                    continue
                for kind, amount in (key.get("current_usages") or {}).items():
                    totals[kind] = totals.get(kind, 0) + float(amount)
                for kind, amount in today_usage.get((key["uuid"], today), {}).items():
                    today_totals[kind] = today_totals.get(kind, 0) + float(amount)
            if not totals:
                continue
            # Per day, as the agent sends it, so the service's day and week
            # limits count: today what this script reported today, the rest
            # of the month spread over the days before. The month's figure is
            # their sum.
            earlier_days = [
                today.replace(day=day) for day in range(1, today.day)
            ]
            daily = []
            for kind, total in totals.items():
                todays = min(today_totals.get(kind, 0.0), total)
                rest = total - todays
                if not earlier_days:
                    todays = total
                share = round(rest / len(earlier_days), 2) if earlier_days else 0
                for day in earlier_days:
                    daily.append(
                        {"type": kind, "date": day.isoformat(), "amount": f"{share:.2f}"}
                    )
                daily.append(
                    {"type": kind, "date": today.isoformat(), "amount": f"{todays:.2f}"}
                )
            call(
                "POST",
                "marketplace-component-usages/set_usage",
                {"resource": resource["uuid"], "usages": [], "daily_usages": daily},
            )
        if resources:
            log(f"reported usage of {len(resources)} service(s)")


def main():
    if not TOKEN and not PASSWORD:
        sys.exit("Set WALDUR_PASSWORD (or WALDUR_TOKEN) for the provider user.")
    if not TOKEN:
        sign_in()
    offerings = demo_offerings()
    if not offerings:
        sys.exit("No demo offering visible to this token: run seed.py first.")
    log(f"answering for {', '.join(sorted(offerings.values()))}")
    tick = 0
    while True:
        handle_orders(offerings)
        handle_keys(offerings)
        if tick % USAGE_EVERY == 0:
            report_usage(offerings)
        tick += 1
        time.sleep(TICK)


if __name__ == "__main__":
    main()
