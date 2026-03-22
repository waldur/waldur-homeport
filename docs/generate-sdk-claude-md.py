#!/usr/bin/env python3
"""Generate CLAUDE.md for js-client from an OpenAPI schema.

Produces a CLAUDE.md that helps AI coding assistants understand
the SDK structure, naming conventions, and how to find things.

Usage:
    python generate-sdk-claude-md.py <openapi-schema.yaml> <output-path>

Example:
    uv run python docs/generate-sdk-claude-md.py waldur-openapi-schema.yaml ../js-client/CLAUDE.md
"""

import sys
from collections import defaultdict

import yaml

STATIC_HEADER = """\
# Waldur TypeScript SDK (waldur-js-client)

> Auto-generated package. Do not edit files in `src/` manually — they are
> regenerated from the backend OpenAPI schema.

## What this package is

`waldur-js-client` is the TypeScript SDK for the Waldur cloud management platform API.
It is generated from `waldur-mastermind`'s OpenAPI schema using `@hey-api/openapi-ts`.
The frontend (`waldur-homeport`) imports functions and types from this package.

## File structure

```
src/
├── index.ts          — Re-exports everything; main entry point
├── sdk.gen.ts        — All SDK functions (one per API endpoint)
├── types.gen.ts      — All TypeScript type definitions
├── client.gen.ts     — Auto-generated client initialization
├── client/           — HTTP client implementation (fetch-based)
│   ├── client.ts     — createClient() factory
│   ├── types.ts      — Client type definitions
│   └── utils.ts      — Request/response utilities
└── core/             — Auth, serialization, parameter handling
```

**Key files by size:** `types.gen.ts` (~90K lines) and `sdk.gen.ts` (~50K lines) are very
large. Use `SDK-REFERENCE.md` (if available) as a compact index to find functions
without reading the full files.

## Naming conventions

### SDK functions (in `sdk.gen.ts`)

Functions are named from the OpenAPI `operationId`, which follows this pattern:

```
{resource}_{action}
```

**CRUD operations:**
| Action | HTTP Method | Example |
|--------|-------------|---------|
| `{resource}_list` | GET (collection) | `marketplace_resources_list` |
| `{resource}_retrieve` | GET (single) | `marketplace_resources_retrieve` |
| `{resource}_create` | POST | `marketplace_resources_create` |
| `{resource}_update` | PUT | `marketplace_resources_update` |
| `{resource}_partial_update` | PATCH | `marketplace_resources_partial_update` |
| `{resource}_destroy` | DELETE | `marketplace_resources_destroy` |
| `{resource}_count` | HEAD | `marketplace_resources_count` |

**Custom actions:** `{resource}_{action_name}` — e.g., `marketplace_resources_terminate`,
`marketplace_resources_move_resource`.

**Resource naming:** derived from URL path segments with hyphens replaced by underscores:
- `/api/marketplace-resources/` → `marketplace_resources_*`
- `/api/openstack-tenants/` → `openstack_tenants_*`
- `/api/admin/announcements/` → `admin_announcements_*`

### Types (in `types.gen.ts`)

| Pattern | Example | When to use |
|---------|---------|-------------|
| `PascalCaseName` | `MarketplaceResource` | Response/read types |
| `PascalCaseNameRequest` | `MarketplaceResourceRequest` | Request/write types |
| `{Name}Enum` | `ResourceStateEnum` | Enum types |
| `{OperationId}Data` | `MarketplaceResourcesListData` | Per-operation request options |
| `{OperationId}Response` | `MarketplaceResourcesListResponse` | Per-operation response type |
| `{OperationId}Errors` | `MarketplaceResourcesListErrors` | Per-operation error type |

### How to predict names

If you know the API URL, you can predict the function name:
1. Take the URL path: `/api/marketplace-resources/{uuid}/terminate/`
2. Strip `/api/` prefix and trailing slash
3. Remove path parameters (`{uuid}`)
4. Replace hyphens with underscores, slashes with underscores
5. Result: `marketplace_resources_terminate`

## Usage pattern

```typescript
import {
  marketplaceResourcesList,
  marketplaceResourcesRetrieve,
  type MarketplaceResource,
  type MarketplaceResourceRequest,
} from 'waldur-js-client';

// List with query parameters
const { data } = await marketplaceResourcesList({
  query: { customer_uuid: '...' },
});

// Get single resource
const { data: resource } = await marketplaceResourcesRetrieve({
  path: { uuid: '...' },
});
```

## Finding functions

1. **Know the URL?** Predict the function name using the naming convention above
2. **Know the domain?** Search `sdk.gen.ts` for the resource prefix (e.g., `marketplace_resources_`)
3. **Have SDK-REFERENCE.md?** Browse the tag-organized index for a compact overview
4. **Looking for a type?** Search `types.gen.ts` for the PascalCase model name
"""


def load_schema(path):
    with open(path) as f:
        return yaml.safe_load(f)


def extract_tag_stats(schema):
    """Extract endpoint counts per tag."""
    tags = defaultdict(int)
    for _path, methods in schema.get("paths", {}).items():
        for method, operation in methods.items():
            if method in ("parameters", "servers", "summary", "description"):
                continue
            for tag in operation.get("tags", ["untagged"]):
                tags[tag] += 1
    return tags


def group_tags(tag_stats):
    """Group related tags by prefix for readability."""
    groups = defaultdict(list)
    for tag, count in sorted(tag_stats.items(), key=lambda x: -x[1]):
        prefix = tag.split("-")[0]
        groups[prefix].append((tag, count))
    return groups


def generate_tag_summary(tag_stats):
    """Generate a compact tag summary section."""
    lines = []
    lines.append("## API domains (by endpoint count)")
    lines.append("")
    lines.append(
        f"The API has **{sum(tag_stats.values())} endpoints** across "
        f"**{len(tag_stats)} tags**. Top domains:"
    )
    lines.append("")
    lines.append("| Tag | Endpoints | Domain |")
    lines.append("|-----|-----------|--------|")

    # Map common prefixes to domain descriptions
    domain_hints = {
        "marketplace": "Marketplace (offerings, resources, orders, plans, stats)",
        "openstack": "OpenStack cloud (instances, tenants, networks, volumes)",
        "proposal": "Proposals and calls for projects",
        "admin": "System administration",
        "users": "User management",
        "customers": "Customer/organization management",
        "projects": "Project management",
        "invoices": "Billing and invoicing",
        "invoice-items": "Invoice line items",
        "support": "Support tickets",
        "vmware": "VMware virtualization",
        "aws": "Amazon Web Services",
        "azure": "Microsoft Azure",
        "digitalocean": "DigitalOcean",
        "rancher": "Rancher Kubernetes",
        "openportal": "OpenPortal integration",
        "remote-waldur": "Remote Waldur federation",
        "slurm": "SLURM HPC",
        "booking": "Resource booking",
        "chat": "AI chat assistant",
        "notification": "Notifications",
        "permission": "Permissions and roles",
        "api-auth": "Authentication (SAML2, Keycloak, password, etc.)",
        "offering": "Offering configuration",
        "onboarding": "User onboarding and verification",
        "reviewer": "Proposal review",
        "call": "Call management",
        "broadcast": "Broadcast messages",
        "assignment": "Assignment batches",
        "backend": "Backend resources",
        "billing": "Billing",
        "user-invitations": "User invitations",
    }

    sorted_tags = sorted(tag_stats.items(), key=lambda x: -x[1])
    for tag, count in sorted_tags[:50]:
        prefix = tag.split("-")[0]
        domain = domain_hints.get(tag, domain_hints.get(prefix, ""))
        lines.append(f"| `{tag}` | {count} | {domain} |")

    remaining = len(tag_stats) - 50
    if remaining > 0:
        remaining_count = sum(c for _, c in sorted_tags[50:])
        lines.append(
            f"| _...{remaining} more tags_ | {remaining_count} | |"
        )

    lines.append("")
    return "\n".join(lines)


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <openapi-schema.yaml> <output-path>")
        sys.exit(1)

    schema_path = sys.argv[1]
    output_path = sys.argv[2]

    schema = load_schema(schema_path)
    tag_stats = extract_tag_stats(schema)
    tag_summary = generate_tag_summary(tag_stats)

    content = STATIC_HEADER + "\n" + tag_summary

    with open(output_path, "w") as f:
        f.write(content)

    print(f"      Generated CLAUDE.md: {len(tag_stats)} tags documented")


if __name__ == "__main__":
    main()
