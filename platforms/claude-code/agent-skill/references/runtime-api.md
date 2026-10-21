# Local Runtime API

Generated from the SDK Runtime MCP allow-list and its API contracts. This bridge exposes only the local Tobub desktop Runtime; it is not a general HTTP client.

MCP arguments are grouped as `path`, `query`, and `body`. Bind route placeholders through `path`; pass query values in `query`; pass JSON request fields in `body`. Runtime request fields use snake_case. The JSON schemas below describe the SDK's documented contract; Runtime validation remains authoritative and may accept additional fields where `additionalProperties` is enabled.

Successful calls return Runtime data under `data`; failures return a structured `error`. Mutations are never retried automatically. A Skill run response is acceptance only: poll its returned `run_id` until it reaches a terminal state. Set `body.browser.headless` to `false` when a Skill should open a visible browser.

## tobub_runtime_health

**Endpoint:** `GET /api/system/health`

Check whether the local desktop Runtime is alive.

### Request arguments

No path, query, or body arguments are declared.

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    },
    "uptime": {
      "type": "number"
    }
  },
  "additionalProperties": true
}
```

## tobub_runtime_version

**Endpoint:** `GET /api/system/version`

Read the actual Runtime version before using bundled syntax.

### Request arguments

No path, query, or body arguments are declared.

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "runtime_version": {
      "type": "string"
    },
    "node": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    },
    "tobub_id": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_runtime_capabilities

**Endpoint:** `GET /api/system/capabilities`

Read live AI method schemas and Runtime capability descriptions. This is not the complete Atom catalog.

### Request arguments

No path, query, or body arguments are declared.

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "ai_assistant": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string"
        },
        "scenes_path": {
          "type": "string"
        },
        "configurable": {
          "type": "boolean"
        },
        "operations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "category": {
                "type": "string"
              },
              "description": {
                "type": "string"
              }
            },
            "additionalProperties": true
          }
        }
      },
      "additionalProperties": true
    },
    "skill_tobub": {
      "type": "object",
      "properties": {
        "ai": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string"
            },
            "contract_version": {
              "type": "integer"
            },
            "methods": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "schemaVersion": {
                    "type": "integer"
                  },
                  "method": {
                    "type": "string"
                  },
                  "operation": {
                    "type": "string"
                  },
                  "version": {
                    "type": "string"
                  },
                  "stability": {
                    "type": "string"
                  },
                  "title": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "additionalProperties": true
              }
            }
          },
          "additionalProperties": true
        },
        "monitor": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string"
            },
            "operations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "category": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "additionalProperties": true
              }
            }
          },
          "additionalProperties": true
        },
        "skills": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string"
            },
            "operations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "category": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "additionalProperties": true
              }
            }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_catalog

**Endpoint:** `GET /api/skills/ai`

Discover Skills explicitly enabled for external AI. Supports pagination.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `query`

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500,
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": false
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skills": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "catalog_summary": {
            "type": "string"
          },
          "scope": {
            "type": "string"
          },
          "instructions": {
            "type": "string"
          },
          "platform": {
            "type": "string",
            "nullable": true
          },
          "input_schema": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "output_schema": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    },
    "limit": {
      "type": "integer"
    },
    "offset": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_contract

**Endpoint:** `GET /api/skills/get/:id/ai-doc`

Read an AI-enabled Skill invocation contract before running it.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skill_id": {
      "type": "string"
    },
    "content": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_list

**Endpoint:** `POST /api/skills/page`

Search local declarations for an explicitly requested authoring or management task. This does not enable external AI invocation.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "source_type": {
      "type": "string",
      "description": "Source Type."
    },
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "category": {
      "type": "string",
      "description": "Category."
    },
    "source": {
      "type": "string",
      "description": "Source."
    },
    "market_skill_id": {
      "type": "string",
      "description": "Market Skill Id."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skills": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "schema_version": {
            "type": "integer"
          },
          "metadata": {
            "type": "object",
            "properties": {
              "category": {
                "type": "string"
              },
              "source": {
                "type": "string"
              },
              "market_skill_id": {
                "type": "string"
              },
              "tags": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "additionalProperties": true
          },
          "source_type": {
            "type": "string"
          },
          "remote_id": {
            "type": "string",
            "nullable": true
          },
          "remote_revision": {
            "type": "string",
            "nullable": true
          },
          "editable": {
            "type": "boolean"
          },
          "rule_uuid": {
            "type": "string",
            "nullable": true
          },
          "input_schema": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "output_schema": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "ui_schema": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "requirements": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "defaults": {
            "type": "object",
            "properties": {
              "params": {
                "type": "object",
                "properties": {
                  "maxScrollTimes": {
                    "type": "integer"
                  }
                },
                "additionalProperties": true
              },
              "browser": {
                "type": "object",
                "properties": {
                  "headless": {
                    "type": "boolean"
                  }
                },
                "additionalProperties": true
              }
            },
            "additionalProperties": true
          },
          "created_at": {
            "type": "string"
          },
          "updated_at": {
            "type": "string"
          },
          "code_length": {
            "type": "integer"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_get

**Endpoint:** `GET /api/skills/get/:id`

Read a declaration for authoring or inspection. Use source_type/editable; remote declarations do not expose code.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skill": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "schema_version": {
          "type": "integer"
        },
        "metadata": {
          "type": "object",
          "properties": {
            "category": {
              "type": "string"
            },
            "source": {
              "type": "string"
            },
            "market_skill_id": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "additionalProperties": true
        },
        "source_type": {
          "type": "string"
        },
        "remote_id": {
          "type": "string",
          "nullable": true
        },
        "remote_revision": {
          "type": "string",
          "nullable": true
        },
        "editable": {
          "type": "boolean"
        },
        "code": {
          "type": "string"
        },
        "input_schema": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "output_schema": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "ui_schema": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "requirements": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "defaults": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "execution_config": {
          "type": "object",
          "properties": {
            "params": {
              "type": "object",
              "properties": {
                "maxScrollTimes": {
                  "type": "integer"
                }
              },
              "additionalProperties": true
            },
            "browser": {
              "type": "object",
              "properties": {
                "headless": {
                  "type": "boolean"
                }
              },
              "additionalProperties": true
            },
            "execution": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string"
                },
                "account_id": {
                  "type": "integer"
                }
              },
              "additionalProperties": true
            },
            "timeout_ms": {
              "type": "integer"
            },
            "updated_at": {
              "type": "string"
            }
          },
          "additionalProperties": true
        },
        "created_at": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_check

**Endpoint:** `POST /api/skills/check`

Compile-only validation of a candidate save body. Never executes code, starts a browser or saves it.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    },
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "code": {
      "type": "string",
      "description": "Stable platform or capability code."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "rule_uuid": {
      "type": "string",
      "nullable": true,
      "description": "Rule Uuid."
    },
    "input_schema": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Input Schema."
    },
    "output_schema": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Output Schema."
    },
    "ui_schema": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Ui Schema."
    },
    "requirements": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Requirements."
    },
    "defaults": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Defaults."
    },
    "metadata": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Metadata."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "valid": {
      "type": "boolean"
    },
    "diagnostics": {
      "type": "array",
      "items": {}
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_create

**Endpoint:** `POST /api/skills/add`

Save a new local Skill. code is plain JavaScript, not Base64. Check the candidate first.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "source_type": {
      "type": "string",
      "description": "Source Type."
    },
    "code": {
      "type": "string",
      "description": "Stable platform or capability code."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "rule_uuid": {
      "type": "string",
      "description": "Rule Uuid."
    },
    "metadata": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string",
          "description": "Category."
        },
        "source": {
          "type": "string",
          "description": "Source."
        },
        "market_skill_id": {
          "type": "string",
          "description": "Market Skill Id."
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Tags."
        }
      },
      "additionalProperties": true,
      "description": "Metadata."
    },
    "input_schema": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "description": "Type."
        }
      },
      "additionalProperties": true,
      "description": "Input Schema."
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "description": "Type."
        }
      },
      "additionalProperties": true,
      "description": "Output Schema."
    },
    "ui_schema": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Ui Schema."
    },
    "requirements": {
      "type": "object",
      "properties": {
        "profile": {
          "type": "string",
          "description": "Profile."
        }
      },
      "additionalProperties": true,
      "description": "Requirements."
    },
    "defaults": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "properties": {
            "maxScrollTimes": {
              "type": "integer",
              "description": "MaxScrollTimes."
            }
          },
          "additionalProperties": true,
          "description": "Params."
        },
        "browser": {
          "type": "object",
          "properties": {
            "run_mode": {
              "type": "string",
              "description": "Run Mode."
            },
            "profile_id": {
              "type": "string",
              "description": "Browser profile identifier."
            },
            "auth_mode": {
              "type": "string",
              "description": "Auth Mode."
            },
            "headless": {
              "type": "boolean",
              "description": "Headless."
            }
          },
          "additionalProperties": true,
          "description": "Browser."
        },
        "execution": {
          "type": "object",
          "properties": {
            "account_id": {
              "type": "integer",
              "description": "Account identifier."
            }
          },
          "additionalProperties": true,
          "description": "Execution."
        }
      },
      "additionalProperties": true,
      "description": "Defaults."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "source_type": {
      "type": "string"
    },
    "remote_id": {
      "type": "string"
    },
    "remote_revision": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    },
    "defaults": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "properties": {
            "maxScrollTimes": {
              "type": "integer"
            }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "metadata": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string"
        },
        "source": {
          "type": "string"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_update

**Endpoint:** `POST /api/skills/update/:id`

Update an editable local Skill requested by the user. Check the complete candidate first.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "code": {
      "type": "string",
      "description": "Stable platform or capability code."
    },
    "defaults": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "properties": {
            "maxScrollTimes": {
              "type": "integer",
              "description": "MaxScrollTimes."
            }
          },
          "additionalProperties": true,
          "description": "Params."
        },
        "browser": {
          "type": "object",
          "properties": {
            "headless": {
              "type": "boolean",
              "description": "Headless."
            }
          },
          "additionalProperties": true,
          "description": "Browser."
        },
        "execution": {
          "type": "object",
          "properties": {
            "account_id": {
              "type": "integer",
              "description": "Account identifier."
            }
          },
          "additionalProperties": true,
          "description": "Execution."
        }
      },
      "additionalProperties": true,
      "description": "Defaults."
    },
    "rule_uuid": {
      "type": "string",
      "nullable": true,
      "description": "Rule Uuid."
    },
    "requirements": {
      "type": "object",
      "properties": {
        "profile": {
          "type": "string",
          "description": "Profile."
        }
      },
      "additionalProperties": true,
      "description": "Requirements."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skill": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "defaults": {
          "type": "object",
          "properties": {
            "params": {
              "type": "object",
              "properties": {
                "maxScrollTimes": {
                  "type": "integer"
                }
              },
              "additionalProperties": true
            },
            "browser": {
              "type": "object",
              "properties": {
                "headless": {
                  "type": "boolean"
                }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_install_check

**Endpoint:** `POST /api/skills/install/check`

Validate a Tobub installation package and report its dependency/install plan. This is different from a save body.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "package": {
      "type": "object",
      "properties": {
        "package_type": {
          "type": "string",
          "description": "Package Type."
        },
        "manifest_version": {
          "type": "integer",
          "description": "Manifest Version."
        },
        "package_id": {
          "type": "string",
          "description": "Package Id."
        },
        "package_version": {
          "type": "string",
          "description": "Package Version."
        },
        "source": {
          "type": "string",
          "description": "Source."
        },
        "created_at": {
          "type": "string",
          "description": "Created At."
        },
        "runtime_compatibility": {
          "type": "object",
          "properties": {
            "min_version": {
              "type": "string",
              "description": "Min Version."
            },
            "max_version": {
              "type": "string",
              "description": "Max Version."
            }
          },
          "additionalProperties": true,
          "description": "Runtime Compatibility."
        },
        "requirements": {
          "type": "object",
          "properties": {
            "platform": {
              "type": "string",
              "description": "Platform code."
            },
            "rule": {
              "type": "string",
              "description": "Rule."
            }
          },
          "additionalProperties": true,
          "description": "Requirements."
        },
        "skill": {
          "type": "object",
          "properties": {
            "market_skill_id": {
              "type": "string",
              "description": "Market Skill Id."
            },
            "release_id": {
              "type": "string",
              "description": "Release Id."
            },
            "name": {
              "type": "string",
              "description": "Display or resource name."
            },
            "skill_version": {
              "type": "string",
              "description": "Skill Version."
            },
            "source_type": {
              "type": "string",
              "description": "Source Type."
            },
            "skill_code": {
              "type": "string",
              "description": "Skill Code."
            },
            "platform": {
              "type": "string",
              "description": "Platform code."
            },
            "requirements": {
              "type": "object",
              "properties": {},
              "additionalProperties": true,
              "description": "Requirements."
            },
            "defaults": {
              "type": "object",
              "properties": {},
              "additionalProperties": true,
              "description": "Defaults."
            }
          },
          "additionalProperties": true,
          "description": "Skill."
        },
        "platform": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string",
              "description": "Stable platform or capability code."
            },
            "name": {
              "type": "string",
              "description": "Display or resource name."
            },
            "version": {
              "type": "string",
              "description": "Version."
            },
            "base_url": {
              "type": "string",
              "description": "Base URL of the platform or upstream service."
            },
            "capabilities": {
              "type": "array",
              "items": {},
              "description": "Capabilities."
            },
            "domains": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "domain": {
                    "type": "string",
                    "description": "Domain."
                  },
                  "domain_type": {
                    "type": "string",
                    "description": "Domain Type."
                  }
                },
                "additionalProperties": true
              },
              "description": "Domains."
            },
            "definition_hash": {
              "type": "string",
              "description": "Definition Hash."
            }
          },
          "additionalProperties": true,
          "description": "Platform code."
        },
        "rule": {
          "type": "object",
          "properties": {
            "platform": {
              "type": "string",
              "description": "Platform code."
            },
            "version": {
              "type": "string",
              "description": "Version."
            },
            "schema_version": {
              "type": "string",
              "description": "Schema Version."
            },
            "hash": {
              "type": "string",
              "description": "Hash."
            },
            "rules": {
              "type": "object",
              "properties": {
                "platform": {
                  "type": "string",
                  "description": "Platform code."
                },
                "version": {
                  "type": "string",
                  "description": "Version."
                },
                "meta": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": true,
                  "description": "Meta."
                },
                "extractors": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": true,
                  "description": "Extractors."
                },
                "routes": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": true,
                  "description": "Routes."
                },
                "actions": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": true,
                  "description": "Actions."
                },
                "selectors": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": true,
                  "description": "Selectors."
                }
              },
              "additionalProperties": true,
              "description": "Rules."
            }
          },
          "additionalProperties": true,
          "description": "Rule."
        }
      },
      "additionalProperties": true,
      "description": "Package."
    },
    "platform_policy": {
      "type": "string",
      "description": "Platform Policy."
    },
    "rule_policy": {
      "type": "string",
      "description": "Rule Policy."
    },
    "activation": {
      "type": "string",
      "description": "Activation."
    }
  },
  "additionalProperties": true,
  "required": [
    "package"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "installable": {
      "type": "boolean"
    },
    "status": {
      "type": "string"
    },
    "checks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "message": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "warnings": {
      "type": "array",
      "items": {}
    },
    "errors": {
      "type": "array",
      "items": {}
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_install

**Endpoint:** `POST /api/skills/install`

Install an explicitly requested local Tobub package and its dependency plan.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "idempotency_key": {
      "type": "string",
      "description": "Client-generated key that makes a retried mutation safe to repeat."
    },
    "package": {
      "type": "object",
      "properties": {},
      "additionalProperties": true,
      "description": "Package."
    },
    "platform_policy": {
      "type": "string",
      "description": "Platform Policy."
    },
    "rule_policy": {
      "type": "string",
      "description": "Rule Policy."
    },
    "activation": {
      "type": "string",
      "description": "Activation."
    },
    "installation_id": {
      "type": "string",
      "description": "Installation Id."
    },
    "allow_platform_current_change": {
      "type": "boolean",
      "description": "Allow Platform Current Change."
    }
  },
  "additionalProperties": true,
  "required": [
    "idempotency_key",
    "package"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "installation_id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "skill": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "package_version": {
          "type": "string"
        },
        "source_type": {
          "type": "string"
        },
        "rule_uuid": {
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "platform": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string"
        },
        "created": {
          "type": "boolean"
        },
        "version": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": true
    },
    "rule": {
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "version": {
          "type": "string"
        },
        "hash": {
          "type": "string"
        },
        "created": {
          "type": "boolean"
        },
        "status": {
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "activation": {
      "type": "object",
      "properties": {
        "requested": {
          "type": "string"
        },
        "changed": {
          "type": "boolean"
        },
        "current_rule_uuid": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": true
    },
    "warnings": {
      "type": "array",
      "items": {}
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_ai_contract_save

**Endpoint:** `POST /api/skills/:id/ai-contract`

Set an external AI catalog summary, scope, instructions and enabled flag only when the user requests AI exposure.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "enabled": {
      "type": "boolean",
      "description": "Whether the feature or configuration is enabled."
    },
    "catalog_summary": {
      "type": "string",
      "description": "Catalog Summary."
    },
    "scope": {
      "type": "string",
      "description": "Scope."
    },
    "instructions": {
      "type": "string",
      "description": "Instructions."
    }
  },
  "additionalProperties": true,
  "required": [
    "enabled",
    "instructions"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skill_id": {
      "type": "string"
    },
    "ai": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "catalog_summary": {
          "type": "string"
        },
        "scope": {
          "type": "string"
        },
        "instructions": {
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "editable": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_execution_config_save

**Endpoint:** `POST /api/skills/execution-config/:id`

Save user-owned execution overrides. Does not run the Skill.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "params": {
      "type": "object",
      "properties": {
        "maxScrollTimes": {
          "type": "integer",
          "description": "MaxScrollTimes."
        }
      },
      "additionalProperties": true,
      "description": "Params."
    },
    "browser": {
      "type": "object",
      "properties": {
        "run_mode": {
          "type": "string",
          "description": "Run Mode."
        },
        "profile_id": {
          "type": "string",
          "description": "Browser profile identifier."
        },
        "auth_mode": {
          "type": "string",
          "description": "Auth Mode."
        },
        "headless": {
          "type": "boolean",
          "description": "Headless."
        }
      },
      "additionalProperties": true,
      "description": "Browser."
    },
    "execution": {
      "type": "object",
      "properties": {
        "agent_id": {
          "type": "string",
          "description": "Agent Id."
        },
        "account_id": {
          "type": "integer",
          "description": "Account identifier."
        }
      },
      "additionalProperties": true,
      "description": "Execution."
    },
    "timeout_ms": {
      "type": "integer",
      "description": "Timeout Ms."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "execution_config": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "properties": {
            "maxScrollTimes": {
              "type": "integer"
            }
          },
          "additionalProperties": true
        },
        "browser": {
          "type": "object",
          "properties": {
            "run_mode": {
              "type": "string"
            },
            "profile_id": {
              "type": "string"
            },
            "auth_mode": {
              "type": "string"
            },
            "headless": {
              "type": "boolean"
            }
          },
          "additionalProperties": true
        },
        "execution": {
          "type": "object",
          "properties": {
            "agent_id": {
              "type": "string"
            },
            "account_id": {
              "type": "integer"
            }
          },
          "additionalProperties": true
        },
        "timeout_ms": {
          "type": "integer"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_run

**Endpoint:** `POST /api/skills/run`

Start a local saved Skill. Requires skill_id and execution.agent_id (string or null). For a visible browser, set body.browser.headless to false. Read its contract; code override is not exposed by this tool. Returns acceptance, not completion.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    },
    "skill_id": {
      "type": "string",
      "description": "Skill identifier."
    },
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "code": {
      "type": "string",
      "description": "Stable platform or capability code."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "timeout_ms": {
      "type": "integer",
      "description": "Timeout Ms."
    },
    "params": {
      "type": "object",
      "properties": {
        "maxScrollTimes": {
          "type": "integer",
          "description": "MaxScrollTimes."
        },
        "minComments": {
          "type": "integer",
          "description": "MinComments."
        }
      },
      "additionalProperties": true,
      "description": "Params."
    },
    "browser": {
      "type": "object",
      "properties": {
        "run_mode": {
          "type": "string",
          "description": "Run Mode."
        },
        "profile_id": {
          "type": "string",
          "description": "Browser profile identifier."
        },
        "auth_mode": {
          "type": "string",
          "description": "Auth Mode."
        },
        "headless": {
          "type": "boolean",
          "description": "Headless."
        }
      },
      "additionalProperties": true,
      "description": "Browser."
    },
    "execution": {
      "type": "object",
      "properties": {
        "agent_id": {
          "type": "string",
          "description": "Agent Id."
        },
        "account_id": {
          "type": "integer",
          "description": "Account identifier."
        },
        "rule_override": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Rule Override."
        },
        "rule_uuid": {
          "type": "string",
          "description": "Rule Uuid."
        },
        "domain_mode": {
          "type": "string",
          "description": "Domain Mode."
        }
      },
      "additionalProperties": true,
      "description": "Execution."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string"
    },
    "params": {
      "type": "object",
      "properties": {
        "maxScrollTimes": {
          "type": "integer"
        },
        "minComments": {
          "type": "integer"
        }
      },
      "additionalProperties": true
    },
    "browser": {
      "type": "object",
      "properties": {
        "run_mode": {
          "type": "string"
        },
        "profile_id": {
          "type": "string"
        },
        "auth_mode": {
          "type": "string"
        },
        "headless": {
          "type": "boolean"
        }
      },
      "additionalProperties": true
    },
    "execution": {
      "type": "object",
      "properties": {
        "agent_id": {
          "type": "string"
        },
        "account_id": {
          "type": "integer"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_run_status

**Endpoint:** `GET /api/skills/runs/:runId`

Poll a known run_id until a terminal state. A missing run after restart is not proof of success.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "runId": {
      "type": "string",
      "description": "RunId."
    }
  },
  "required": [
    "runId"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "task_id": {
      "type": "string"
    },
    "agent_id": {
      "type": "string"
    },
    "skill_id": {
      "type": "string"
    },
    "session_id": {
      "type": "integer"
    },
    "session_key": {
      "type": "string"
    },
    "browser_open": {
      "type": "boolean"
    },
    "cancellable": {
      "type": "boolean"
    },
    "started_at": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_cancel

**Endpoint:** `POST /api/skills/cancel`

Request cancellation of a known run_id, then poll until terminal. A true acknowledgement is not completed cleanup.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "additionalProperties": true,
  "required": [
    "run_id"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "cancelled": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_history

**Endpoint:** `POST /api/skill-runs/page`

Read persisted execution history and outputs after completion or Runtime restart.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "skill_id": {
      "type": "string",
      "description": "Skill identifier."
    },
    "session_id": {
      "type": "integer",
      "description": "Browser or recording session identifier."
    },
    "root_execution_id": {
      "type": "string",
      "description": "Root Execution Id."
    },
    "invocation_id": {
      "type": "string",
      "description": "Invocation Id."
    },
    "status": {
      "type": "string",
      "description": "Status."
    },
    "date_from": {
      "type": "string",
      "description": "Date From."
    },
    "date_to": {
      "type": "string",
      "description": "Date To."
    },
    "agent_id": {
      "type": "string",
      "description": "Agent Id."
    },
    "account_id": {
      "type": "integer",
      "description": "Account identifier."
    },
    "profile_id": {
      "type": "string",
      "description": "Browser profile identifier."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skill_runs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "skill_id": {
            "type": "string"
          },
          "skill_name": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "started_at": {
            "type": "string"
          },
          "ended_at": {
            "type": "string"
          },
          "duration_ms": {
            "type": "integer"
          },
          "error": {
            "type": "string",
            "nullable": true
          },
          "agent_id": {
            "type": "string"
          },
          "account_id": {
            "type": "integer"
          },
          "profile_id": {
            "type": "string"
          },
          "session_id": {
            "type": "integer"
          },
          "execution_id": {
            "type": "string"
          },
          "root_execution_id": {
            "type": "string"
          },
          "parent_execution_id": {
            "type": "string"
          },
          "invocation_id": {
            "type": "string"
          },
          "invocation_depth": {
            "type": "integer"
          },
          "output": {},
          "rule_uuid": {
            "type": "string"
          },
          "rule_version": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_delete

**Endpoint:** `POST /api/skills/del/:id`

Delete the explicitly selected Skill and dependent local records; inspect effects before proceeding.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "cleanup": {
      "type": "object",
      "properties": {
        "skill": {
          "type": "integer"
        },
        "skillRuns": {
          "type": "integer"
        },
        "scheduledTasks": {
          "type": "integer"
        },
        "sessions": {
          "type": "integer"
        },
        "content": {
          "type": "integer"
        },
        "actions": {
          "type": "integer"
        },
        "dailyStats": {
          "type": "integer"
        },
        "executionEvents": {
          "type": "integer"
        },
        "dataCollections": {
          "type": "integer"
        },
        "contentItem": {
          "type": "integer"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_platform_list

**Endpoint:** `POST /api/platforms/page`

List locally configured platforms and their stable identifiers.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "Domain."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "platforms": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "code": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "base_url": {
            "type": "string"
          },
          "capabilities": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "config": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "current_rule_uuid": {
            "type": "string"
          },
          "domains": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "platform_id": {
                  "type": "integer"
                },
                "domain": {
                  "type": "string"
                },
                "domain_type": {
                  "type": "string"
                }
              },
              "additionalProperties": true
            }
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_account_list

**Endpoint:** `POST /api/accounts/page`

List account identifiers and runnable Profile summaries. Secret/extra data is omitted.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "platform_id": {
      "type": "integer",
      "description": "Platform identifier."
    },
    "include_inactive": {
      "type": "boolean",
      "description": "Whether inactive records should be included."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "accounts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "platform_name": {
            "type": "string"
          },
          "id": {
            "type": "integer"
          },
          "platform_id": {
            "type": "integer"
          },
          "account_key": {
            "type": "string"
          },
          "display_name": {
            "type": "string"
          },
          "external_uid": {
            "type": "string"
          },
          "extra": {
            "type": "object",
            "properties": {
              "remark": {
                "type": "string"
              }
            },
            "additionalProperties": true
          },
          "is_active": {
            "type": "integer"
          },
          "default_profile": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "kind": {
                "type": "string"
              },
              "auth_status": {
                "type": "string"
              }
            },
            "additionalProperties": true
          },
          "profile_contexts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "profile_id": {
                  "type": "string"
                },
                "account_id": {
                  "type": "integer"
                },
                "is_default": {
                  "type": "boolean"
                },
                "is_active": {
                  "type": "boolean"
                },
                "auth_status": {
                  "type": "string"
                }
              },
              "additionalProperties": true
            }
          },
          "created_at": {
            "type": "string"
          },
          "updated_at": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_profile_list

**Endpoint:** `POST /api/profiles/page`

List Profile identity and authentication status; browser configuration is omitted.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "include_inactive": {
      "type": "boolean",
      "description": "Whether inactive records should be included."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "engine": {
            "type": "string"
          },
          "kind": {
            "type": "string"
          },
          "is_active": {
            "type": "boolean"
          },
          "auth_status": {
            "type": "string"
          },
          "environment_changed": {
            "type": "boolean"
          },
          "last_used_at": {
            "type": "string",
            "nullable": true
          },
          "browser_config": {
            "type": "object",
            "properties": {
              "locale": {
                "type": "string"
              },
              "has_proxy": {
                "type": "boolean"
              }
            },
            "additionalProperties": true
          },
          "created_at": {
            "type": "string"
          },
          "updated_at": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_plugin_list

**Endpoint:** `POST /api/plugins/page`

Inspect installed local plugin declarations before using required plugin capabilities.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "keyword": {
      "type": "string",
      "description": "Keyword."
    },
    "enabled": {
      "type": "boolean",
      "description": "Whether the feature or configuration is enabled."
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "plugins": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "metadata": {
            "type": "object",
            "properties": {
              "apiVersion": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "methods": {
                "type": "object",
                "properties": {
                  "decode": {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": true
                  }
                },
                "additionalProperties": true
              }
            },
            "additionalProperties": true
          },
          "enabled": {
            "type": "boolean"
          },
          "contentHash": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_plugin_get

**Endpoint:** `GET /api/plugins/get/:id`

Read one installed plugin declaration and its capability contract.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "plugin": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "metadata": {
          "type": "object",
          "properties": {
            "apiVersion": {
              "type": "integer"
            },
            "name": {
              "type": "string"
            },
            "methods": {
              "type": "object",
              "properties": {
                "decode": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": true
                }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        },
        "enabled": {
          "type": "boolean"
        },
        "contentHash": {
          "type": "string"
        },
        "content": {
          "type": "string"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_rule_current

**Endpoint:** `GET /api/rules/current/:platform`

Read the current published platform Rule. Never infer Rule method names from another platform.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string",
      "description": "Platform code."
    }
  },
  "required": [
    "platform"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string"
    },
    "exists": {
      "type": "boolean"
    },
    "runnable": {
      "type": "boolean"
    },
    "source": {
      "type": "string"
    },
    "rule_uuid": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "rules": {
      "type": "object",
      "properties": {
        "platform": {
          "type": "string"
        },
        "version": {
          "type": "string"
        },
        "routes": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "extractors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "actions": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "selectors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "warnings": {
      "type": "array",
      "items": {}
    }
  },
  "additionalProperties": true
}
```

## tobub_rule_list

**Endpoint:** `POST /api/rules/page/:platform`

Read platform Rule versions; select the Skill-bound published version when present.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string",
      "description": "Platform code."
    }
  },
  "required": [
    "platform"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "uuid": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "version": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "source": {
            "type": "string"
          },
          "validation_status": {
            "type": "string"
          },
          "validation_errors": {
            "type": "array",
            "items": {}
          },
          "rules": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_rule_check

**Endpoint:** `POST /api/rules/check/:platform`

Validate an explicit Rule candidate without publishing it.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string",
      "description": "Platform code."
    }
  },
  "required": [
    "platform"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "Version."
    },
    "rules": {
      "type": "object",
      "properties": {
        "routes": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Routes."
        },
        "extractors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Extractors."
        },
        "actions": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Actions."
        },
        "selectors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Selectors."
        }
      },
      "additionalProperties": true,
      "description": "Rules."
    },
    "rule": {
      "type": "object",
      "properties": {
        "routes": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Routes."
        },
        "extractors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Extractors."
        },
        "actions": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Actions."
        },
        "selectors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Selectors."
        }
      },
      "additionalProperties": true,
      "description": "Rules."
    },
    "body": {
      "type": "object",
      "properties": {
        "routes": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Routes."
        },
        "extractors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Extractors."
        },
        "actions": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Actions."
        },
        "selectors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Selectors."
        }
      },
      "additionalProperties": true,
      "description": "Rules."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body.",
  "anyOf": [
    {
      "required": [
        "rules"
      ]
    },
    {
      "required": [
        "rule"
      ]
    },
    {
      "required": [
        "body"
      ]
    }
  ]
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string"
    },
    "saveable": {
      "type": "boolean"
    },
    "runnable": {
      "type": "boolean"
    },
    "validation_status": {
      "type": "string"
    },
    "errors": {
      "type": "array",
      "items": {}
    },
    "warnings": {
      "type": "array",
      "items": {}
    },
    "rules": {
      "type": "object",
      "properties": {
        "platform": {
          "type": "string"
        },
        "version": {
          "type": "string"
        },
        "meta": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "baseUrl": {
              "type": "string"
            },
            "capabilities": {
              "type": "array",
              "items": {}
            }
          },
          "additionalProperties": true
        },
        "routes": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "extractors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "actions": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        },
        "selectors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_rule_save

**Endpoint:** `POST /api/rules/save/:platform`

Save an explicitly requested Rule draft; this does not publish it.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string",
      "description": "Platform code."
    }
  },
  "required": [
    "platform"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "Version."
    },
    "uuid": {
      "type": "string",
      "description": "Uuid."
    },
    "source": {
      "type": "string",
      "description": "Source."
    },
    "note": {
      "type": "string",
      "description": "Note."
    },
    "rules": {
      "type": "object",
      "properties": {
        "platform": {
          "type": "string",
          "description": "Platform code."
        },
        "version": {
          "type": "string",
          "description": "Version."
        },
        "routes": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Routes."
        },
        "extractors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Extractors."
        },
        "actions": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Actions."
        },
        "selectors": {
          "type": "object",
          "properties": {},
          "additionalProperties": true,
          "description": "Selectors."
        }
      },
      "additionalProperties": true,
      "description": "Rules."
    }
  },
  "additionalProperties": true,
  "required": [
    "rules"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "platform": {
      "type": "string"
    },
    "rule": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "uuid": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "version": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "validation_status": {
          "type": "string"
        },
        "validation_errors": {
          "type": "array",
          "items": {}
        },
        "rules": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "runnable": {
      "type": "boolean"
    },
    "errors": {
      "type": "array",
      "items": {}
    },
    "warnings": {
      "type": "array",
      "items": {}
    }
  },
  "additionalProperties": true
}
```

## tobub_rule_publish

**Endpoint:** `POST /api/rules/publish/:uuid`

Publish the selected validated Rule draft. Explicit activate_current is required: false publishes without changing platform current; true requires the user to request that platform-wide change.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string",
      "description": "Uuid."
    }
  },
  "required": [
    "uuid"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "activate_current": {
      "type": "boolean",
      "description": "Activate Current."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "rule": {
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "version": {
          "type": "string"
        },
        "status": {
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "deduplicated": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}
```

## tobub_rule_select

**Endpoint:** `POST /api/rules/select`

Change platform current Rule only when the user explicitly requests the platform-wide change.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string",
      "description": "Uuid."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    }
  },
  "additionalProperties": true,
  "required": [
    "uuid"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "rule": {
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "status": {
          "type": "string"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_start

**Endpoint:** `POST /api/skill-recordings`

Open a recording browser for user demonstration. Do not assume recording grants permission to submit website actions.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "start_url": {
      "type": "string",
      "description": "Initial page URL for the browser session."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "skill_id": {
      "type": "string",
      "description": "Skill identifier."
    },
    "browser": {
      "type": "object",
      "properties": {
        "run_mode": {
          "type": "string",
          "description": "Run Mode."
        },
        "profile_id": {
          "type": "string",
          "description": "Browser profile identifier."
        },
        "auth_mode": {
          "type": "string",
          "description": "Auth Mode."
        },
        "headless": {
          "type": "boolean",
          "description": "Headless."
        }
      },
      "additionalProperties": true,
      "description": "Browser."
    },
    "account_id": {
      "type": "integer",
      "description": "Account identifier."
    },
    "browser_type": {
      "type": "string",
      "description": "Browser Type."
    },
    "locale": {
      "type": "string",
      "description": "Locale."
    },
    "ai_scenes": {
      "type": "object",
      "properties": {
        "recording_assist": {
          "type": "boolean",
          "description": "Recording Assist."
        }
      },
      "additionalProperties": true,
      "description": "Ai Scenes."
    },
    "ai_settings_url": {
      "type": "string",
      "description": "Ai Settings Url."
    }
  },
  "additionalProperties": true,
  "required": [
    "start_url"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_get

**Endpoint:** `GET /api/skill-recordings/:id`

Read redacted recording status and evidence.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "evidence": {
      "type": "object",
      "properties": {
        "events": {
          "type": "array",
          "items": {}
        },
        "network": {
          "type": "array",
          "items": {}
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_stop

**Endpoint:** `POST /api/skill-recordings/:id/stop`

Stop recording while retaining evidence for deterministic compilation.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "evidence": {
      "type": "object",
      "properties": {
        "events": {
          "type": "array",
          "items": {}
        },
        "network": {
          "type": "array",
          "items": {}
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_pause

**Endpoint:** `POST /api/skill-recordings/:id/pause`

Pause evidence collection.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_resume

**Endpoint:** `POST /api/skill-recordings/:id/resume`

Resume evidence collection.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_cancel

**Endpoint:** `POST /api/skill-recordings/:id/cancel`

Cancel the requested recording and release its browser.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "cancelled": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}
```

## tobub_recording_compile

**Endpoint:** `POST /api/skill-recordings/:id/compile`

Compile completed recording evidence into a candidate; does not save or run it.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    }
  },
  "additionalProperties": true,
  "required": [
    "name"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "skill": {
      "type": "object",
      "properties": {
        "schema_version": {
          "type": "integer"
        },
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "code": {
          "type": "string"
        },
        "input_schema": {
          "type": "object",
          "properties": {},
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_skill_author_proposal

**Endpoint:** `POST /api/skills/author`

Optional: use the locally configured Tobub AI scene for an editable proposal. Requires a configured model Profile, may send evidence to its provider, and never saves the proposal.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "description": "Mode."
    },
    "prompt": {
      "type": "string",
      "description": "Prompt."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "skill_id": {
      "type": "string",
      "description": "Skill identifier."
    },
    "recording_session_id": {
      "type": "string",
      "description": "Recording Session Id."
    },
    "evidence_source": {
      "type": "object",
      "properties": {
        "workspace_id": {
          "type": "string",
          "description": "Workspace Id."
        },
        "run_id": {
          "type": "string",
          "description": "Run identifier."
        },
        "evidence_event_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Evidence Event Ids."
        },
        "artifact_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Artifact Ids."
        }
      },
      "additionalProperties": false,
      "description": "Evidence Source.",
      "required": [
        "workspace_id",
        "run_id"
      ]
    }
  },
  "additionalProperties": true,
  "required": [
    "prompt"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "proposal": {
      "type": "object",
      "properties": {
        "schema_version": {
          "type": "integer"
        },
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "code": {
          "type": "string"
        },
        "diagnostics": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "severity": {
                "type": "string"
              },
              "source": {
                "type": "string"
              },
              "message": {
                "type": "string"
              },
              "line": {
                "type": "integer"
              },
              "column": {
                "type": "integer"
              }
            },
            "additionalProperties": true
          }
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_schedule_list

**Endpoint:** `POST /api/schedule/page`

List local scheduled tasks.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "skill_id": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "cron_expression": {
            "type": "string"
          },
          "enabled": {
            "type": "boolean"
          },
          "last_run_at": {
            "type": "string",
            "nullable": true
          },
          "next_run_at": {
            "type": "string"
          },
          "last_status": {
            "type": "string",
            "nullable": true
          },
          "last_error": {
            "type": "string",
            "nullable": true
          },
          "config": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "created_at": {
            "type": "string"
          },
          "updated_at": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_schedule_create

**Endpoint:** `POST /api/schedule/add`

Create a recurring local task only when the user explicitly requests recurrence.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    },
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "skill_id": {
      "type": "string",
      "description": "Skill identifier."
    },
    "cron_expression": {
      "type": "string",
      "description": "Cron expression used to schedule execution."
    },
    "enabled": {
      "type": "boolean",
      "description": "Whether the feature or configuration is enabled."
    },
    "config": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "properties": {
            "maxScrollTimes": {
              "type": "integer",
              "description": "MaxScrollTimes."
            }
          },
          "additionalProperties": true,
          "description": "Params."
        },
        "browser": {
          "type": "object",
          "properties": {
            "run_mode": {
              "type": "string",
              "description": "Run Mode."
            },
            "profile_id": {
              "type": "string",
              "description": "Browser profile identifier."
            },
            "auth_mode": {
              "type": "string",
              "description": "Auth Mode."
            },
            "headless": {
              "type": "boolean",
              "description": "Headless."
            }
          },
          "additionalProperties": true,
          "description": "Browser."
        },
        "execution": {
          "type": "object",
          "properties": {
            "agent_id": {
              "type": "string",
              "nullable": true,
              "description": "Agent Id."
            },
            "account_id": {
              "type": "integer",
              "description": "Account identifier."
            }
          },
          "additionalProperties": true,
          "description": "Execution."
        },
        "timeout_ms": {
          "type": "integer",
          "description": "Timeout Ms."
        }
      },
      "additionalProperties": true,
      "description": "Config."
    }
  },
  "additionalProperties": true,
  "required": [
    "id",
    "name",
    "skill_id",
    "cron_expression"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "skill_id": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "cron_expression": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "config": {
          "type": "object",
          "properties": {
            "params": {
              "type": "object",
              "properties": {
                "maxScrollTimes": {
                  "type": "integer"
                }
              },
              "additionalProperties": true
            },
            "browser": {
              "type": "object",
              "properties": {
                "run_mode": {
                  "type": "string"
                },
                "profile_id": {
                  "type": "string"
                },
                "auth_mode": {
                  "type": "string"
                },
                "headless": {
                  "type": "boolean"
                }
              },
              "additionalProperties": true
            },
            "execution": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string",
                  "nullable": true
                },
                "account_id": {
                  "type": "integer"
                }
              },
              "additionalProperties": true
            },
            "timeout_ms": {
              "type": "integer"
            }
          },
          "additionalProperties": true
        },
        "last_run_at": {
          "type": "string",
          "nullable": true
        },
        "next_run_at": {
          "type": "string"
        },
        "last_status": {
          "type": "string",
          "nullable": true
        },
        "last_error": {
          "type": "string",
          "nullable": true
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_schedule_update

**Endpoint:** `POST /api/schedule/update/:id`

Update an explicitly selected local schedule. Include body.skill_id (the existing ID if unchanged) so the bridge can validate its local source; other fields are partial updates.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Display or resource name."
    },
    "skill_id": {
      "type": "string",
      "description": "Skill identifier."
    },
    "cron_expression": {
      "type": "string",
      "description": "Cron expression used to schedule execution."
    },
    "enabled": {
      "type": "boolean",
      "description": "Whether the feature or configuration is enabled."
    },
    "config": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "properties": {
            "maxScrollTimes": {
              "type": "integer",
              "description": "MaxScrollTimes."
            }
          },
          "additionalProperties": true,
          "description": "Params."
        },
        "browser": {
          "type": "object",
          "properties": {
            "headless": {
              "type": "boolean",
              "description": "Headless."
            }
          },
          "additionalProperties": true,
          "description": "Browser."
        },
        "execution": {
          "type": "object",
          "properties": {
            "agent_id": {
              "type": "string",
              "nullable": true,
              "description": "Agent Id."
            }
          },
          "additionalProperties": true,
          "description": "Execution."
        },
        "timeout_ms": {
          "type": "integer",
          "description": "Timeout Ms."
        }
      },
      "additionalProperties": true,
      "description": "Config."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "skill_id": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "cron_expression": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "config": {
          "type": "object",
          "properties": {
            "params": {
              "type": "object",
              "properties": {
                "maxScrollTimes": {
                  "type": "integer"
                }
              },
              "additionalProperties": true
            },
            "browser": {
              "type": "object",
              "properties": {
                "headless": {
                  "type": "boolean"
                }
              },
              "additionalProperties": true
            },
            "execution": {
              "type": "object",
              "properties": {
                "agent_id": {
                  "type": "string",
                  "nullable": true
                }
              },
              "additionalProperties": true
            },
            "timeout_ms": {
              "type": "integer"
            }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_schedule_delete

**Endpoint:** `POST /api/schedule/del/:id`

Delete an explicitly selected local schedule.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "nullable": true
}
```

## tobub_data_collections

**Endpoint:** `GET /api/sessions/:sessionId/data-collections`

List datasets produced by a known execution session.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "integer",
      "description": "SessionId."
    }
  },
  "required": [
    "sessionId"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `query`

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "Parameters read from the URL query string."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "data_collections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "mode": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "session_id": {
            "type": "integer"
          },
          "record_count": {
            "type": "integer"
          },
          "byte_count": {
            "type": "integer"
          },
          "dropped_count": {
            "type": "integer"
          },
          "outputs": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string"
                },
                "format": {
                  "type": "string"
                },
                "relative_path": {
                  "type": "string"
                },
                "record_count": {
                  "type": "integer"
                },
                "byte_count": {
                  "type": "integer"
                },
                "status": {
                  "type": "string"
                }
              },
              "additionalProperties": true
            }
          },
          "metadata": {
            "type": "object",
            "properties": {
              "roomId": {
                "type": "string"
              }
            },
            "additionalProperties": true
          },
          "retention_days": {
            "type": "integer"
          },
          "expires_at": {
            "type": "string"
          },
          "error": {
            "type": "string",
            "nullable": true
          },
          "created_at": {
            "type": "string"
          },
          "updated_at": {
            "type": "string"
          },
          "closed_at": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_data_collection_get

**Endpoint:** `GET /api/sessions/:sessionId/data-collections/:collectionId`

Inspect a dataset and its output metadata.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "integer",
      "description": "SessionId."
    },
    "collectionId": {
      "type": "string",
      "description": "CollectionId."
    }
  },
  "required": [
    "sessionId",
    "collectionId"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "data_collection": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "mode": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "session_id": {
          "type": "integer"
        },
        "record_count": {
          "type": "integer"
        },
        "byte_count": {
          "type": "integer"
        },
        "dropped_count": {
          "type": "integer"
        },
        "outputs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              },
              "format": {
                "type": "string"
              },
              "relative_path": {
                "type": "string"
              },
              "record_count": {
                "type": "integer"
              },
              "byte_count": {
                "type": "integer"
              },
              "status": {
                "type": "string"
              }
            },
            "additionalProperties": true
          }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "roomId": {
              "type": "string"
            }
          },
          "additionalProperties": true
        },
        "retention_days": {
          "type": "integer"
        },
        "expires_at": {
          "type": "string"
        },
        "error": {
          "type": "string",
          "nullable": true
        },
        "created_at": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        },
        "closed_at": {
          "type": "string"
        }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

## tobub_data_records

**Endpoint:** `GET /api/sessions/:sessionId/data-collections/:collectionId/records`

Read a bounded page of locally collected data.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "integer",
      "description": "SessionId."
    },
    "collectionId": {
      "type": "string",
      "description": "CollectionId."
    }
  },
  "required": [
    "sessionId",
    "collectionId"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `query`

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "Parameters read from the URL query string."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "data_collection": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "mode": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "session_id": {
          "type": "integer"
        },
        "record_count": {
          "type": "integer"
        },
        "byte_count": {
          "type": "integer"
        },
        "dropped_count": {
          "type": "integer"
        },
        "outputs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              },
              "format": {
                "type": "string"
              },
              "relative_path": {
                "type": "string"
              },
              "record_count": {
                "type": "integer"
              },
              "byte_count": {
                "type": "integer"
              },
              "status": {
                "type": "string"
              }
            },
            "additionalProperties": true
          }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "roomId": {
              "type": "string"
            }
          },
          "additionalProperties": true
        },
        "retention_days": {
          "type": "integer"
        },
        "expires_at": {
          "type": "string"
        },
        "error": {
          "type": "string",
          "nullable": true
        },
        "created_at": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        },
        "closed_at": {
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "records": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sequence": {
            "type": "integer"
          },
          "type": {
            "type": "string"
          },
          "capturedAt": {
            "type": "string"
          },
          "payload": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string"
              }
            },
            "additionalProperties": true
          },
          "meta": {
            "type": "object",
            "properties": {
              "roomId": {
                "type": "string"
              }
            },
            "additionalProperties": true
          },
          "payloadHash": {
            "type": "string"
          },
          "byteCount": {
            "type": "integer"
          }
        },
        "additionalProperties": true
      }
    },
    "total": {
      "type": "integer"
    },
    "offset": {
      "type": "integer"
    },
    "limit": {
      "type": "integer"
    },
    "has_more": {
      "type": "boolean"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_create

**Endpoint:** `POST /api/skill-authoring/sessions`

Create a bounded Discover workspace for a user-requested unknown goal. Optional configured AI provider; distinct from generating a reusable Skill.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `body`

```json
{
  "type": "object",
  "properties": {
    "goal": {
      "type": "string",
      "description": "Goal."
    },
    "start_url": {
      "type": "string",
      "description": "Initial page URL for the browser session."
    },
    "platform": {
      "type": "string",
      "description": "Platform code."
    },
    "browser": {
      "type": "object",
      "properties": {
        "run_mode": {
          "type": "string",
          "description": "Run Mode."
        },
        "proxy": {
          "type": "object",
          "properties": {
            "server": {
              "type": "string",
              "description": "Server."
            }
          },
          "additionalProperties": true,
          "description": "Proxy."
        },
        "headless": {
          "type": "boolean",
          "description": "Headless."
        }
      },
      "additionalProperties": true,
      "description": "Browser."
    },
    "execution": {
      "type": "object",
      "properties": {
        "agent_id": {
          "type": "string",
          "nullable": true,
          "description": "Agent Id."
        }
      },
      "additionalProperties": true,
      "description": "Execution."
    },
    "policy": {
      "type": "object",
      "properties": {
        "approval_mode": {
          "type": "string",
          "description": "Approval Mode."
        },
        "observation_mode": {
          "type": "string",
          "description": "Observation Mode."
        }
      },
      "additionalProperties": true,
      "description": "Policy."
    },
    "budget": {
      "type": "object",
      "properties": {
        "max_ai_calls": {
          "type": "integer",
          "description": "Max Ai Calls."
        },
        "max_input_tokens": {
          "type": "integer",
          "description": "Max Input Tokens."
        },
        "max_output_tokens": {
          "type": "integer",
          "description": "Max Output Tokens."
        },
        "max_tool_calls": {
          "type": "integer",
          "description": "Max Tool Calls."
        },
        "max_duration_ms": {
          "type": "integer",
          "description": "Max Duration Ms."
        },
        "max_asset_bytes": {
          "type": "integer",
          "description": "Max Asset Bytes."
        }
      },
      "additionalProperties": true,
      "description": "Budget."
    }
  },
  "additionalProperties": true,
  "required": [
    "goal"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "goal": {
      "type": "string"
    },
    "start_url": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    },
    "policy": {
      "type": "object",
      "properties": {
        "approval_mode": {
          "type": "string"
        },
        "observation_mode": {
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "version": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_list

**Endpoint:** `GET /api/skill-authoring/sessions`

List Discover workspaces.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `query`

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "type": "integer",
      "description": "Maximum number of records to return; 1–500."
    },
    "offset": {
      "type": "integer",
      "description": "Number of records to skip before returning results; must be non-negative."
    }
  },
  "additionalProperties": true,
  "description": "Parameters read from the URL query string."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "sessions": {
      "type": "array",
      "items": {}
    },
    "total": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_get

**Endpoint:** `GET /api/skill-authoring/sessions/:id`

Read a workspace and its active Run.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "version": {
      "type": "integer"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_run

**Endpoint:** `POST /api/skill-authoring/sessions/:id/runs`

Start bounded exploration with expected_session_version and idempotency_key. Discover completes a task and records evidence; it never generates a Skill.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "kind": {
      "type": "string",
      "description": "Kind."
    },
    "expected_session_version": {
      "type": "integer",
      "description": "Expected workspace version used for optimistic concurrency control."
    },
    "idempotency_key": {
      "type": "string",
      "description": "Client-generated key that makes a retried mutation safe to repeat."
    }
  },
  "additionalProperties": true,
  "required": [
    "kind",
    "expected_session_version",
    "idempotency_key"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "session_id": {
      "type": "string"
    },
    "kind": {
      "type": "string"
    },
    "control_owner": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "phase": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_run_status

**Endpoint:** `GET /api/skill-authoring/runs/:run_id`

Read exploration progress, waiting state and pending action.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "session_id": {
      "type": "string"
    },
    "control_owner": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_pause

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/pause`

Pause an exploration and release its active resources.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_resume

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/resume`

Resume a user-requested exploration from a fresh observation.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_cancel

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/cancel`

Cancel a known exploration and release resources.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_approve

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/approval/approve`

Approve only the exact pending action_hash the user authorized. Never approve automatically merely because a tool is available.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "action_hash": {
      "type": "string",
      "description": "Action Hash."
    }
  },
  "additionalProperties": true,
  "required": [
    "action_hash"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_reject

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/approval/reject`

Reject the exact pending action_hash.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "action_hash": {
      "type": "string",
      "description": "Action Hash."
    }
  },
  "additionalProperties": true,
  "required": [
    "action_hash"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_input

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/input`

Supply requested non-sensitive business input. User credentials remain manual.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "request_id": {
      "type": "string",
      "description": "Request Id."
    },
    "values": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Query."
        }
      },
      "additionalProperties": true,
      "description": "Values."
    }
  },
  "additionalProperties": true,
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "pending_input": {
      "type": "string",
      "nullable": true
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_takeover

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/takeover`

Record that the user is taking browser control; requires request_id.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "request_id": {
      "type": "string",
      "description": "Request Id."
    }
  },
  "additionalProperties": true,
  "required": [
    "request_id"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_release

**Endpoint:** `POST /api/skill-authoring/runs/:run_id/release`

Return browser control after the user finishes; requires request_id.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "run_id": {
      "type": "string",
      "description": "Run identifier."
    }
  },
  "required": [
    "run_id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `body`

```json
{
  "type": "object",
  "properties": {
    "request_id": {
      "type": "string",
      "description": "Request Id."
    }
  },
  "additionalProperties": true,
  "required": [
    "request_id"
  ],
  "description": "JSON request body."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_artifacts

**Endpoint:** `GET /api/skill-authoring/sessions/:id/artifacts`

Read immutable exploration_result artifacts from an explicitly selected completed Run.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `query`

```json
{
  "type": "object",
  "properties": {
    "kind": {
      "type": "string",
      "description": "Kind."
    }
  },
  "additionalProperties": true,
  "description": "Parameters read from the URL query string."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "artifacts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "schema_version": {
            "type": "integer"
          },
          "id": {
            "type": "string"
          },
          "session_id": {
            "type": "string"
          },
          "kind": {
            "type": "string"
          },
          "revision": {
            "type": "integer"
          },
          "payload": {
            "type": "object",
            "properties": {
              "summary": {
                "type": "string"
              },
              "findings": {
                "type": "array",
                "items": {}
              },
              "skill_calls": {
                "type": "array",
                "items": {}
              },
              "unresolved": {
                "type": "array",
                "items": {}
              },
              "page_knowledge_refs": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "rule_key": {
                      "type": "string"
                    },
                    "variant_id": {
                      "type": "string"
                    },
                    "structural_fingerprint": {
                      "type": "string"
                    },
                    "revision": {
                      "type": "integer"
                    },
                    "evidence_event_ids": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  },
                  "additionalProperties": true
                }
              },
              "process_summary": {
                "type": "object",
                "properties": {
                  "evidence_event_count": {
                    "type": "integer"
                  },
                  "mcp_action_count": {
                    "type": "integer"
                  },
                  "macro_count": {
                    "type": "integer"
                  },
                  "successful_macro_count": {
                    "type": "integer"
                  },
                  "skill_invocation_count": {
                    "type": "integer"
                  },
                  "observation_count": {
                    "type": "integer"
                  },
                  "vision_observation_count": {
                    "type": "integer"
                  },
                  "planner_decision_count": {
                    "type": "integer"
                  },
                  "runtime_action_count": {
                    "type": "integer"
                  },
                  "fallback_count": {
                    "type": "integer"
                  }
                },
                "additionalProperties": true
              }
            },
            "additionalProperties": true
          },
          "evidence_event_ids": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "input_fingerprint": {
            "type": "string"
          },
          "context_fingerprint": {
            "type": "string"
          },
          "created_at": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```

## tobub_discover_events

**Endpoint:** `GET /api/skill-authoring/sessions/:id/events`

Read bounded, ordered evidence for an explicitly selected workspace/Run.

### Request arguments

Pass these fields inside the MCP `path`, `query`, or `body` object as shown.

### `path`

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Resource identifier."
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false,
  "description": "Parameters read from the URL path."
}
```

### `query`

```json
{
  "type": "object",
  "properties": {
    "after_sequence": {
      "type": "integer",
      "minimum": 0,
      "description": "Return events after this sequence cursor."
    },
    "before_sequence": {
      "type": "integer",
      "minimum": 1,
      "description": "Return events before this sequence cursor."
    },
    "run_id": {
      "type": "string",
      "description": "Restrict evidence to one authoring Run."
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500,
      "description": "Maximum number of records to return; 1–500."
    }
  },
  "additionalProperties": false,
  "description": "Use exactly one of after_sequence or before_sequence; run_id is optional."
}
```

### Successful response data

```json
{
  "type": "object",
  "properties": {
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "run_id": {
            "type": "string"
          },
          "sequence": {
            "type": "integer"
          },
          "source": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "summary": {
            "type": "object",
            "properties": {},
            "additionalProperties": true
          },
          "asset_refs": {
            "type": "array",
            "items": {}
          }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```
