#!/usr/bin/env python3
"""Automação de postagens para operação de afiliados.

Fluxo sugerido:
1. Criar ideias de post com IA (texto + CTA + links UTM).
2. Revisar manualmente o CSV antes da publicação.
3. Publicar no horário planejado usando API oficial de cada plataforma
   (ou via agregador como Buffer / Metricool / Publer).

Este script evita automações proibidas (browser bots) e foca em API.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import os
from dataclasses import dataclass
from typing import Iterable, List

import json
from urllib import parse, request


@dataclass
class Post:
    publish_at: dt.datetime
    platform: str
    text: str
    media_url: str
    affiliate_url: str


def parse_datetime(value: str) -> dt.datetime:
    # formato esperado: 2026-03-07 09:30
    return dt.datetime.strptime(value, "%Y-%m-%d %H:%M")


def load_posts(csv_path: str) -> List[Post]:
    posts: List[Post] = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {"publish_at", "platform", "text", "media_url", "affiliate_url"}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Colunas ausentes no CSV: {', '.join(sorted(missing))}")

        for row in reader:
            posts.append(
                Post(
                    publish_at=parse_datetime(row["publish_at"]),
                    platform=row["platform"].strip().lower(),
                    text=row["text"].strip(),
                    media_url=row["media_url"].strip(),
                    affiliate_url=row["affiliate_url"].strip(),
                )
            )
    return posts


def should_publish(post: Post, now: dt.datetime) -> bool:
    # janela de 10 minutos para disparo
    delta = now - post.publish_at
    return dt.timedelta(minutes=0) <= delta <= dt.timedelta(minutes=10)


def send_to_buffer(post: Post, profile_map: dict[str, str], dry_run: bool = True) -> None:
    """Publica via Buffer API (exemplo)."""
    profile_id = profile_map.get(post.platform)
    if not profile_id:
        raise ValueError(f"Perfil Buffer não mapeado para plataforma: {post.platform}")

    payload = {
        "text": f"{post.text}\n\n{post.affiliate_url}",
        "profile_ids[]": profile_id,
        "media[photo]": post.media_url,
        "scheduled_at": post.publish_at.isoformat(),
    }

    if dry_run:
        print(f"[DRY-RUN] Publicaria em {post.platform}: {payload}")
        return

    token = os.getenv("BUFFER_ACCESS_TOKEN")
    if not token:
        raise EnvironmentError("Defina BUFFER_ACCESS_TOKEN nas variáveis de ambiente.")

    endpoint = "https://api.bufferapp.com/1/updates/create.json"
    data = parse.urlencode(payload).encode("utf-8")
    query = parse.urlencode({"access_token": token})
    req = request.Request(f"{endpoint}?{query}", data=data, method="POST")

    with request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    print(f"Post agendado: {post.platform} -> {body.get('update', {}).get('id')}")


def due_posts(posts: Iterable[Post], now: dt.datetime) -> List[Post]:
    return [post for post in posts if should_publish(post, now)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Automação diária de postagens para afiliados")
    parser.add_argument("--csv", default="automation/posts_calendar.csv", help="Caminho para o CSV de posts")
    parser.add_argument("--publish", action="store_true", help="Publica de fato (padrão é dry-run)")
    args = parser.parse_args()

    posts = load_posts(args.csv)
    now = dt.datetime.now()

    # Ajuste com seus profile IDs no Buffer
    profile_map = {
        "instagram": os.getenv("BUFFER_PROFILE_INSTAGRAM", ""),
        "facebook": os.getenv("BUFFER_PROFILE_FACEBOOK", ""),
        "x": os.getenv("BUFFER_PROFILE_X", ""),
        "linkedin": os.getenv("BUFFER_PROFILE_LINKEDIN", ""),
    }

    ready = due_posts(posts, now)
    if not ready:
        print("Nenhum post na janela de publicação.")
        return

    for post in ready:
        send_to_buffer(post, profile_map, dry_run=not args.publish)


if __name__ == "__main__":
    main()
