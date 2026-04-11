# Deploy by Environment

This project supports separated environment files for local and GCP VM deployments.

## Files

- `.env.local`: local development/deploy values (localhost URLs).
- `.env.gcp.example`: template for Google VM values.

Create your VM file from template:

```bash
cp .env.gcp.example .env.gcp
```

Then edit:

- `DB_PASSWORD`
- `JWT_SECRET`
- `VITE_API_URL`
- `APP_PUBLIC_API_BASE_URL`
- `CORS_ALLOWED_ORIGINS`

## Local environment

```bash
docker compose --env-file .env.local up -d --build
```

Stop:

```bash
docker compose --env-file .env.local down
```

## Google VM environment

```bash
docker compose --env-file .env.gcp up -d --build
```

Stop:

```bash
docker compose --env-file .env.gcp down
```

## Notes

- Keep ports `80` and `8891` open in VM firewall (and `22` for SSH).
- If you use a domain/HTTPS later, update `VITE_API_URL`, `APP_PUBLIC_API_BASE_URL`, and `CORS_ALLOWED_ORIGINS` accordingly.
