---
description: Created with Workflow Studio
allowed-tools: Task,AskUserQuestion
---
```mermaid
flowchart TD
    start_node_default([Start])
    end_node_default([End])
    question_1767014159508{AskUserQuestion:<br/>What can I do for you?}
    agent_1767014321051[Quotation_Agent]

    start_node_default --> question_1767014159508
    question_1767014159508 -->|Pricing| agent_1767014321051
    agent_1767014321051 --> end_node_default
```

## Workflow Execution Guide

Follow the Mermaid flowchart above to execute the workflow. Each node type has specific execution methods as described below.

### Execution Methods by Node Type

- **Rectangle nodes**: Execute Sub-Agents using the Task tool
- **Diamond nodes (AskUserQuestion:...)**: Use the AskUserQuestion tool to prompt the user and branch based on their response
- **Diamond nodes (Branch/Switch:...)**: Automatically branch based on the results of previous processing (see details section)
- **Rectangle nodes (Prompt nodes)**: Execute the prompts described in the details section below

### AskUserQuestion Node Details

#### question_1767014159508(What can I do for you?)

**Selection mode:** Single Select (branches based on the selected option)

**Options:**
- **Pricing**: First option
- **Types of product**: Second option
