#!/usr/bin/env python3
"""
Convert Jupyter notebooks to Astro-compatible markdown posts and wire them to projects.

Examples:
    python scripts/convert-notebook.py path/to/notebook.ipynb
    python scripts/convert-notebook.py notebook.ipynb --project lumen --tag agents --tag research
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import nbformat
from nbconvert import MarkdownExporter


def format_list(values):
    return ', '.join(f'"{value}"' for value in values)


def convert_notebook(
    notebook_path: Path,
    output_dir: Path,
    images_dir: Path,
    *,
    title: Optional[str] = None,
    summary: Optional[str] = None,
    tags: Optional[List[str]] = None,
    projects: Optional[List[str]] = None,
    date: Optional[str] = None,
):
    """Convert a Jupyter notebook to a markdown post with frontmatter."""

    with open(notebook_path, 'r') as f:
        nb = nbformat.read(f, as_version=4)

    exporter = MarkdownExporter()
    body, resources = exporter.from_notebook_node(nb)

    notebook_name = notebook_path.stem
    current_date = date or datetime.now().strftime("%Y-%m-%d")
    output_path = output_dir / f"{notebook_name}.md"
    images_output_dir = images_dir / notebook_name

    # Create images directory if there are outputs
    if 'outputs' in resources and resources['outputs']:
        images_output_dir.mkdir(parents=True, exist_ok=True)

        # Save all image outputs
        for filename, data in resources['outputs'].items():
            image_path = images_output_dir / filename
            with open(image_path, 'wb') as f:
                f.write(data)

        # Update image paths in markdown to point to public directory
        for filename in resources['outputs'].keys():
            old_path = f"]({filename})"
            new_path = f"](/posts/{notebook_name}/{filename})"
            body = body.replace(old_path, new_path)

    title_text = title or notebook_name.replace("-", " ").replace("_", " ").title()
    tags_list = tags if tags else ["jupyter", "notebook"]
    summary_text = summary or "Add your summary here"

    with open(output_path, 'w') as f:
        f.write('---\n')
        f.write(f'title: "{title_text}"\n')
        f.write(f'date: "{current_date}"\n')
        f.write(f'summary: "{summary_text}"\n')
        f.write(f'tags: [{format_list(tags_list)}]\n')
        if projects:
            normalized = [project.strip().lower().replace(" ", "-") for project in projects if project.strip()]
            if normalized:
                f.write(f'projects: [{format_list(normalized)}]\n')
        f.write('draft: false\n')
        f.write('---\n\n')
        f.write(body)

    print(f"✓ Converted {notebook_path} to {output_path}")
    if 'outputs' in resources and resources['outputs']:
        print(f"✓ Saved {len(resources['outputs'])} images to {images_output_dir}")
    print(f"\n📝 Next steps:")
    print(f"  1. Edit {output_path}")
    print(f"  2. Update the frontmatter (summary, tags, projects, etc.)")
    print(f"  3. Review the converted content")
    print(f"  4. Run 'npm run dev' to preview")


def parse_args():
    parser = argparse.ArgumentParser(description="Convert a notebook to an Astro content entry.")
    parser.add_argument('notebook_path', type=Path, help='Path to the .ipynb notebook.')
    parser.add_argument('--output-dir', type=Path, default=Path('src/content/posts'), help='Directory for markdown output.')
    parser.add_argument('--images-dir', type=Path, default=Path('public/posts'), help='Directory for exported notebook images.')
    parser.add_argument('--title', type=str, help='Override the generated title.')
    parser.add_argument('--summary', type=str, help='Provide an initial summary.')
    parser.add_argument('--date', type=str, help='Override the generated date (YYYY-MM-DD).')
    parser.add_argument('--tag', action='append', dest='tags', help='Tag to add to the post (repeat flag for multiples).')
    parser.add_argument('--project', action='append', dest='projects', help='Project slug to link (repeat flag for multiples).')
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    if not args.notebook_path.exists():
        print(f"Error: File '{args.notebook_path}' not found")
        sys.exit(1)

    if args.notebook_path.suffix != '.ipynb':
        print("Error: File must be a Jupyter notebook (.ipynb)")
        sys.exit(1)

    convert_notebook(
        args.notebook_path,
        Path(args.output_dir),
        Path(args.images_dir),
        title=args.title,
        summary=args.summary,
        tags=args.tags,
        projects=args.projects,
        date=args.date,
    )
