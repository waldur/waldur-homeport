# Demo data for apps/ai-inference on a local dev stack: three inference
# offerings from three demo providers, two of them ordered for "ML Research"
# with keys, the third left to add. Run inside mastermind:
#
#   waldur shell < apps/ai-inference/demo/seed.py
#
# It builds on the my_infrastructure preset (projects "Demo Project" and
# "ML Research", users member, manager, owner). Rerunning updates in place.
# Prints the provider user's API token for demo/fake_provider.py.
import datetime
from decimal import Decimal

from celery.app.task import Task
from django.utils import timezone
from rest_framework.authtoken.models import Token

from waldur_core.core import encryption
from waldur_core.core.models import User
from waldur_core.permissions.enums import RoleEnum
from waldur_core.permissions.models import Role
from waldur_core.permissions.utils import add_user, has_user
from waldur_core.structure.models import Customer, Project
from waldur_mastermind.marketplace import models as m

# A dev stack without a message broker: what Celery would send goes nowhere.
Task.apply_async = lambda self, *args, **kwargs: None

project = Project.objects.get(name="ML Research")
member = User.objects.get(username="member")
manager = User.objects.get(username="manager")
provider_user, created = User.objects.get_or_create(
    username="provider",
    defaults=dict(full_name="Pat Provider", email="provider@example.com"),
)
if created:
    provider_user.set_password("demo")
    provider_user.save()
category, _ = m.Category.objects.get_or_create(title="AI inference")

now = timezone.now()
today = now.date()
month_start = today.replace(day=1)
next_month = (month_start + datetime.timedelta(days=32)).replace(day=1)
# Usage so far lands on the days before today: today's is what
# fake_provider.py reports, and a reported day replaces what it held.
days = [month_start + datetime.timedelta(days=n) for n in range(today.day - 1)] or [
    today
]

COMPONENTS = {
    "token_cost": dict(
        name="Inference cost",
        measured_unit="USD",
        price=Decimal("1"),
        spending_limit_periods={
            "day": {"default": 5, "maximum": 50},
            "week": {"default": 20, "maximum": 200},
            "month": {"default": 50, "maximum": 500},
        },
    ),
    "input_tokens": dict(name="Input tokens", measured_unit="tokens", price=0),
    "output_tokens": dict(name="Output tokens", measured_unit="tokens", price=0),
}


def offering(provider_name, name, description, models):
    customer, _ = Customer.objects.get_or_create(name=provider_name)
    m.ServiceProvider.objects.get_or_create(customer=customer)
    owner = Role.objects.get(name=RoleEnum.CUSTOMER_OWNER)
    if not has_user(customer, provider_user, owner):
        add_user(customer, provider_user, owner)
    item, _ = m.Offering.objects.update_or_create(
        name=name,
        customer=customer,
        defaults=dict(
            description=description,
            type="Marketplace.SiteAgent",
            category=category,
            state=m.Offering.States.ACTIVE,
            shared=True,
            billable=True,
            plugin_options={
                "enable_api_key_provisioning": True,
                "expose_inference_playground": True,
                "api_key_daily_usage": True,
                "action_on_usage_limit": "pause",
            },
            resource_options={
                "order": ["models"],
                "options": {
                    "models": {
                        "type": "select_string_multi",
                        "label": "Models",
                        "choices": models,
                    }
                },
            },
        ),
    )
    plan, _ = m.Plan.objects.get_or_create(offering=item, name="Pay as you go")
    for component_type, spec in COMPONENTS.items():
        component, _ = m.OfferingComponent.objects.update_or_create(
            offering=item,
            type=component_type,
            defaults=dict(
                name=spec["name"],
                measured_unit=spec["measured_unit"],
                billing_type="usage",
                spending_limit_periods=spec.get("spending_limit_periods", {}),
            ),
        )
        m.PlanComponent.objects.update_or_create(
            plan=plan, component=component, defaults=dict(price=spec["price"])
        )
    return item, plan


def service(item, plan, name, endpoint, limits):
    resource, _ = m.Resource.objects.update_or_create(
        name=name,
        project=project,
        offering=item,
        defaults=dict(
            state=m.Resource.States.OK,
            backend_id=name,
            plan=plan,
            options={"models": ["*"]},
            spending_limits=limits,
        ),
    )
    m.ResourceAccessEndpoint.objects.update_or_create(
        resource=resource, name="OpenAI-compatible API", defaults=dict(url=endpoint)
    )
    return resource


def key(resource, number, description, user, state, limits, month_usage,
        allowed_models=("*",), paused_by_limit=False):
    """A key with this month's usage spread over the days so far."""
    api_key, _ = m.ResourceApiKey.objects.update_or_create(
        resource=resource,
        client_id=f"{resource.backend_id}-{number}" if state != "Creating" else "",
        description=description,
        defaults=dict(
            user=user,
            state=state,
            pending_action="create" if state == "Creating" else "",
            spending_limits=limits or None,
            allowed_models=list(allowed_models),
            current_usages=month_usage or None,
            usage_period=month_start if month_usage else None,
            estimated_cost=Decimal(str((month_usage or {}).get("token_cost", 0))),
            paused_by_limit=paused_by_limit,
            limit_resumes_at=(
                timezone.make_aware(datetime.datetime.combine(next_month, datetime.time()))
                if paused_by_limit
                else None
            ),
            issued_at=None if state == "Creating" else now - datetime.timedelta(days=40),
        ),
    )
    if state != "Creating" and not api_key.key_ciphertext:
        # What reveal shows; a real agent would have minted it.
        api_key.key_ciphertext = encryption.encrypt_value(
            f"sk-demo-{api_key.uuid.hex[:24]}"
        )
        api_key.save(update_fields=["key_ciphertext"])
    api_key.daily_usages.all().delete()
    for component_type, total in (month_usage or {}).items():
        share = Decimal(str(total)) / len(days)
        for day in days:
            m.ResourceApiKeyDailyUsage.objects.create(
                api_key=api_key,
                component_type=component_type,
                date=day,
                usage=share.quantize(Decimal("0.01")),
            )
    return api_key


cborg, cborg_plan = offering(
    "Berkeley Lab (demo)",
    "CBorg API",
    "Lab-hosted open models at no per-token charge, and commercial models at "
    "their list price, through one OpenAI-compatible key.",
    ["lbl/cborg-chat", "lbl/cborg-coder", "lbl/cborg-vision", "openai/gpt-4o",
     "anthropic/claude-sonnet"],
)
alcf, alcf_plan = offering(
    "Argonne (demo)",
    "ALCF Inference Service",
    "Open-weight models on Sophia (NVIDIA DGX A100) and Metis (SambaNova).",
    ["meta-llama/Llama-3.3-70B-Instruct", "meta-llama/Llama-4-Scout",
     "google/gemma-3-27b-it"],
)
offering(
    "Livermore (demo)",
    "LivChat",
    "A chat workspace and an API key for each person, billed to the project.",
    ["livchat/llama-3.3-70b", "livchat/gemma-3-27b", "livchat/gpt-4o"],
)

cborg_resource = service(
    cborg, cborg_plan, "cborg-ml-research", "https://cborg.lbl.example/v1",
    {"token_cost": {"day": 20, "month": 200}},
)
alcf_resource = service(
    alcf, alcf_plan, "alcf-ml-research", "https://inference.alcf.example/v1",
    {"token_cost": {"month": 300}},
)

# Earlier runs of this script created keys without a description match.
m.ResourceApiKey.objects.filter(resource__project=project).delete()
key(cborg_resource, 1, "thesis-runs", member, "OK",
    {"token_cost": {"day": 5, "week": 20, "month": 50}},
    {"input_tokens": 10_800_000, "output_tokens": 3_300_000, "token_cost": 18.4})
# A person holds at most one key per service: this one is shared.
key(cborg_resource, 2, "notebook-dev", None, "Creating",
    {"token_cost": {"day": 2, "month": 20}}, None,
    allowed_models=("lbl/cborg-chat", "lbl/cborg-coder", "lbl/cborg-vision"))
key(alcf_resource, 1, "batch-screening", member, "Paused",
    {"token_cost": {"month": 100}},
    {"input_tokens": 3_200_000, "output_tokens": 1_100_000, "token_cost": 100},
    allowed_models=("meta-llama/Llama-3.3-70B-Instruct", "meta-llama/Llama-4-Scout"),
    paused_by_limit=True)
key(alcf_resource, 2, "pipeline", manager, "OK", {},
    {"input_tokens": 900_000, "output_tokens": 200_000, "token_cost": 12.5})

token, _ = Token.objects.get_or_create(user=provider_user)
print("Seeded: 3 offerings, 2 services and 4 keys in", project.name)
print("Provider token for fake_provider.py:", token.key)
