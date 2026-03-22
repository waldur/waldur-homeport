#!/usr/bin/env python3
"""Generate SDK-REFERENCE.md from an OpenAPI schema.

Produces a compact, searchable index of all SDK functions organized by tag.
Designed to help AI coding assistants navigate the large generated SDK files.

Usage:
    python generate-sdk-catalog.py <openapi-schema.yaml> <output-path>

Example:
    uv run python docs/generate-sdk-catalog.py waldur-openapi-schema.yaml ../js-client/SDK-REFERENCE.md
"""

import sys
from collections import defaultdict

import yaml


def load_schema(path):
    with open(path) as f:
        return yaml.safe_load(f)


def extract_endpoints(schema):
    """Extract all endpoints grouped by tag."""
    tags = defaultdict(list)

    for path, methods in sorted(schema.get("paths", {}).items()):
        for method, operation in methods.items():
            if method in ("parameters", "servers", "summary", "description"):
                continue
            op_tags = operation.get("tags", ["untagged"])
            operation_id = operation.get("operationId", "")
            summary = operation.get("summary", "")
            description = operation.get("description", "")
            # Use summary if available, fall back to first line of description
            desc = summary or (description.split("\n")[0] if description else "")
            # Truncate long descriptions
            if len(desc) > 100:
                desc = desc[:97] + "..."

            for tag in op_tags:
                tags[tag].append(
                    {
                        "function": operation_id,
                        "method": method.upper(),
                        "path": path,
                        "description": desc,
                    }
                )

    return tags


def generate_markdown(tags):
    """Generate the SDK-REFERENCE.md content."""
    lines = []
    lines.append("# Waldur SDK Reference")
    lines.append("")
    lines.append("> Auto-generated from OpenAPI schema. Do not edit manually.")
    lines.append(">")
    lines.append(
        "> This file provides a compact index of all SDK functions in `waldur-js-client`."
    )
    lines.append(
        "> Use it to find the right function name, then import it from `waldur-js-client`."
    )
    lines.append("")

    # Table of contents, sorted by endpoint count descending
    sorted_tags = sorted(tags.items(), key=lambda x: -len(x[1]))

    lines.append("## Table of Contents")
    lines.append("")
    for tag, endpoints in sorted_tags:
        anchor = tag.lower().replace(" ", "-")
        lines.append(f"- [{tag}](#{anchor}) ({len(endpoints)} endpoints)")
    lines.append("")

    # Each tag section
    for tag, endpoints in sorted_tags:
        lines.append(f"## {tag}")
        lines.append("")
        lines.append("| Function | Method | Path | Description |")
        lines.append("|----------|--------|------|-------------|")
        for ep in endpoints:
            fn = f"`{ep['function']}`" if ep["function"] else "_unnamed_"
            desc = ep["description"].replace("|", "\\|")
            lines.append(f"| {fn} | {ep['method']} | `{ep['path']}` | {desc} |")
        lines.append("")

    return "\n".join(lines)


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <openapi-schema.yaml> <output-path>")
        sys.exit(1)

    schema_path = sys.argv[1]
    output_path = sys.argv[2]

    schema = load_schema(schema_path)
    tags = extract_endpoints(schema)

    total_endpoints = sum(len(eps) for eps in tags.values())
    markdown = generate_markdown(tags)

    with open(output_path, "w") as f:
        f.write(markdown)

    print(f"      Generated SDK-REFERENCE.md: {len(tags)} tags, {total_endpoints} endpoints")


if __name__ == "__main__":
    main()
