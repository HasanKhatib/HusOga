#!/usr/bin/env bash
# Validate the agentkan board after any edit under docs/board/. Exit 2 feeds errors back to Claude.
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  */docs/board/*.json|*/docs/board/epics/*.md)
    out=$(cd "$CLAUDE_PROJECT_DIR" && npx --no-install agentkan validate docs/board 2>&1) || { echo "$out" >&2; exit 2; }
    ;;
esac
exit 0
