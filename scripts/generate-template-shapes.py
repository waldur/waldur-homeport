"""Regenerate the workflow diagram's template shapes fixture.

The layout tests draw every call template the backend ships and check the
boxes never overlap. They read
src/proposals/workflow-description/diagram/templateShapes.fixture.json: the
backend's workflow description of each template, cut down to what the drawing
reads. Rerun this whenever a template or the description changes, then refresh
the snapshots:

    cd ../waldur-mastermind
    uv run python ../waldur-homeport/scripts/generate-template-shapes.py
    cd ../waldur-homeport
    yarn prettier --write src/proposals/workflow-description/diagram/templateShapes.fixture.json
    yarn vitest run src/proposals/workflow-description/diagram -u

It runs in waldur-mastermind's environment and needs no database.
"""

import json
import os
import pathlib

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "waldur_core.server.base_settings")

import django  # noqa: E402

django.setup()

from waldur_mastermind.proposal import (  # noqa: E402
    call_templates,
    workflow_description,
)

FIXTURE = (
    pathlib.Path(__file__).resolve().parent.parent
    / "src/proposals/workflow-description/diagram/templateShapes.fixture.json"
)

ACTOR_FIELDS = ("key", "kind", "label")
STEP_FIELDS = (
    "key",
    "name",
    "kind",
    "phase",
    "order",
    "stage",
    "enabled",
    "run_condition",
    "input_steps",
    "outcomes",
    "on_negative",
    "allows_change_requests",
    "decides_automatically",
    "duration_in_days",
    "extra",
    "roles",
    "applicant",
)

EXTRA_FIELDS = ("round_scoped",)
APPLICANT_FIELDS = ("visible", "label")


def pick(values, fields):
    return {field: values[field] for field in fields}


def roles(step):
    # Only the actors who work on the step place it in a lane.
    return [
        {
            "actor": role["actor"],
            "completes": {"value": role["completes"]["value"]},
            "contributes": {"value": role["contributes"]["value"]},
        }
        for role in step["roles"]
        if role["completes"]["value"] or role["contributes"]["value"]
    ]


def shape(description):
    return {
        "actors": [pick(actor, ACTOR_FIELDS) for actor in description["actors"]],
        "steps": [
            {
                **pick(step, STEP_FIELDS),
                "extra": {
                    key: value
                    for key, value in step["extra"].items()
                    if key in EXTRA_FIELDS
                },
                "roles": roles(step),
                "applicant": pick(step["applicant"], APPLICANT_FIELDS),
            }
            for step in description["steps"]
        ],
        "schedule": description["schedule"],
    }


def main():
    shapes = {
        name: shape(workflow_description.describe(call_templates.load(name)))
        for name in sorted(call_templates.names())
    }
    FIXTURE.write_text(json.dumps(shapes, indent=2, default=str) + "\n")
    print(f"Wrote {len(shapes)} templates to {FIXTURE}")


if __name__ == "__main__":
    main()
