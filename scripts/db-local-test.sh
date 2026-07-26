#!/usr/bin/env bash
# Spin up a throwaway local Postgres, apply the Supabase stub + all
# migrations + seed, then run the RLS smoke test. Exits non-zero on any
# failure. Nothing persists — the cluster lives in a temp dir.
set -euo pipefail

# Postgres refuses to run as root; drop to the postgres user if needed.
if [ "$(id -u)" = "0" ]; then
  exec su postgres -s /bin/bash -c "cd $(printf '%q' "$(cd "$(dirname "$0")/.." && pwd)") && exec bash scripts/db-local-test.sh"
fi

cd "$(dirname "$0")/.."

PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
WORK=$(mktemp -d)
export PGDATA="$WORK/pg" PGPORT=54329 PGUSER=postgres PGHOST="$WORK"

cleanup() { "$PGBIN/pg_ctl" -D "$PGDATA" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

"$PGBIN/initdb" -D "$PGDATA" -U postgres --auth=trust >/dev/null
"$PGBIN/pg_ctl" -D "$PGDATA" -o "-k $WORK -p $PGPORT -c listen_addresses=''" -l "$WORK/pg.log" start >/dev/null

PSQL=("$PGBIN/psql" -v ON_ERROR_STOP=1 -q -d postgres)

"${PSQL[@]}" -f scripts/supabase-stub.sql
for f in supabase/migrations/*.sql; do
  echo "applying $f"
  "${PSQL[@]}" -f "$f"
done
echo "applying supabase/seed.sql"
"${PSQL[@]}" -f supabase/seed.sql

echo "running supabase/tests/rls_smoke.sql"
"$PGBIN/psql" -v ON_ERROR_STOP=1 -d postgres -f supabase/tests/rls_smoke.sql | grep "RLS SMOKE TEST PASSED"
echo "OK"
