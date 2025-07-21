#!/usr/bin/env sh
branch="$(git symbolic-ref --short HEAD)"
if [ "$branch" = "main" ]; then
  echo "❌  Push auf 'main' ist untersagt. Bitte Pull Request benutzen."
  exit 1
fi
exit 0
