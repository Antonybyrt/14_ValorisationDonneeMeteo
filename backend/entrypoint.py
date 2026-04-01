import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    import django

    django.setup()

    from django.core.management import call_command

    print("Applying database migrations...", flush=True)
    try:
        call_command("migrate", "--noinput")
    except SystemExit as exc:
        print(f"Migration failed: {exc.code}", file=sys.stderr, flush=True)
        sys.exit(exc.code if exc.code is not None else 1)
    except Exception as exc:
        print(f"Migration error: {exc}", file=sys.stderr, flush=True)
        sys.exit(1)

    print("Migrations complete. Starting server...", flush=True)

    if len(sys.argv) < 2:
        print("No command provided.", file=sys.stderr)
        sys.exit(1)

    # os.execvp remplace le process courant par gunicorn
    # → gunicorn devient PID 1 et reçoit SIGTERM directement (graceful shutdown)
    os.execvp(sys.argv[1], sys.argv[1:])


if __name__ == "__main__":
    main()
