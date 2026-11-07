"""Capture the dry run's "view as" payloads that DryRunPreview.templates.test
renders: every role of a few shipped call templates, at several points of
their happy path and after a rejection at the first step.

Run from waldur-mastermind against any database it can migrate (nothing is
kept: the whole capture is rolled back):

    uv run waldur shell < \\
      ../waldur-homeport/src/proposals/workflow-description/dry-run/fixtures/capture_previews.py

The output replaces previews.json.gz next to this file (``PREVIEWS_OUT``
names another path): gzipped, as the payloads of every role at every
point run to megabytes of JSON. Strings are cut short
and reads the preview never shows are dropped, to keep the fixture small.
"""

import gzip
import json
import os
from pathlib import Path
from unittest import mock

from django.db import transaction
from rest_framework.test import APIClient

from waldur_core.permissions.fixtures import OfferingRole
from waldur_core.structure.tests import factories as structure_factories
from waldur_mastermind.marketplace.tests import factories as marketplace_factories
from waldur_mastermind.proposal import call_templates, dry_run, models
from waldur_mastermind.proposal.enums import RequestedOfferingStates
from waldur_mastermind.proposal.tests import factories, fixtures

TEMPLATES = (
    "extreme_scale",
    "regular_access",
    "ai_for_science",
    "single_panel_review",
)
NEGATIVE = {"declined", "ineligible", "infeasible", "rejected"}
# The reads the preview renders; the rest of the payload is the panel's.
SHOWN = (
    "me",
    "proposal",
    "workflow_states",
    "contributions",
    "offering_assessments",
    "change_requests",
    "released_reports",
    "reviews",
)
SHOWN_PREFIXES = ("step_inputs:", "step_answers:", "step_checklist:")
OUT = Path(
    os.environ.get(
        "PREVIEWS_OUT",
        "../waldur-homeport/src/proposals/workflow-description/dry-run/fixtures/previews.json.gz",
    )
)


class Rollback(Exception):
    pass


def short(value):
    if isinstance(value, str):
        return value if len(value) <= 80 else value[:77] + "..."
    if isinstance(value, list):
        return [short(item) for item in value]
    if isinstance(value, dict):
        return {key: short(item) for key, item in value.items()}
    return value


def trimmed(view):
    view = dict(view)
    view["responses"] = {
        key: short(read)
        for key, read in view["responses"].items()
        if key in SHOWN or key.startswith(SHOWN_PREFIXES)
    }
    return view


def capture():
    fixture = fixtures.ProposalFixture()
    staff = structure_factories.UserFactory(is_staff=True)
    client = APIClient(SERVER_NAME="localhost")
    client.force_authenticate(staff)

    def dry(call, actions, **extra):
        response = client.post(
            factories.CallFactory.get_protected_url(call, "workflow-dry-run"),
            {"actions": actions, **extra},
            format="json",
        )
        assert response.status_code == 200, response.content[:500]
        return json.loads(response.content)

    def import_template(name):
        response = client.post(
            factories.CallFactory.get_protected_list_url("import_call"),
            {
                "manager": fixture.manager.uuid.hex,
                "call_data": call_templates.load(name),
            },
            format="json",
        )
        assert response.status_code == 201, response.content[:500]
        call = models.Call.objects.get(uuid=response.data["call_uuid"])
        for number in range(2):
            offering = marketplace_factories.OfferingFactory(name=f"Offering {number}")
            offering.add_user(structure_factories.UserFactory(), OfferingRole.MANAGER)
            factories.RequestedOfferingFactory(
                call=call,
                state=RequestedOfferingStates.ACCEPTED,
                offering=offering,
                created_by=fixture.owner,
            )
        return call

    def walk(call):
        actions = []
        for _ in range(60):
            data = dry(call, actions)
            if data["proposal_state"] != "in_review":
                return actions
            nxt = data["next"]
            if nxt["can_publish"]:
                actions.append({"publish": True})
                continue
            if nxt["can_advance"]:
                actions.append({"advance": True})
                continue
            step = next(s for s in nxt["steps"] if s["outcomes"])
            outcome = next(o for o in step["outcomes"] if o not in NEGATIVE)
            action = {"step": step["step"], "outcome": outcome}
            if step["round_step"]:
                action["round_step"] = True
            actions.append(action)
        raise AssertionError("The path did not end.")

    result = {}
    for name in TEMPLATES:
        call = import_template(name)
        description = client.get(
            factories.CallFactory.get_protected_url(call, "workflow-description")
        ).json()
        roles = [a["key"] for a in description["actors"] if a["key"] != "system"]
        happy = walk(call)
        first = dry(call, [])["next"]["steps"][0]["step"]
        points = {
            "submitted": [],
            "rejected at the first step": [{"step": first, "reject": True}],
            "half way": happy[: len(happy) // 2],
            "decided": happy,
        }
        result[name] = {}
        for point, actions in points.items():
            result[name][point] = {}
            for role in roles:
                view = dry(call, actions, view_as={"role": role})["view_as"]
                result[name][point][role] = trimmed(view)
    return result


THROTTLE = "waldur_mastermind.proposal.views.WorkflowDryRunThrottle.allow_request"

# The capture holds one transaction across every run, which a run's own
# bounds on its time and its transaction would end.
with (
    mock.patch(THROTTLE, return_value=True),
    mock.patch.object(dry_run, "TRANSACTION_TIMEOUT_SINCE", 10**9),
    mock.patch.object(dry_run, "TIMEOUT_SECONDS", 3600),
):
    try:
        with transaction.atomic():
            captured = capture()
            raise Rollback()
    except Rollback:
        pass

OUT.write_bytes(
    gzip.compress(
        json.dumps(captured, separators=(",", ":"), sort_keys=True).encode(),
        mtime=0,
    )
)
print(f"Wrote {OUT}: {OUT.stat().st_size} bytes")
