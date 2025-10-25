#!/usr/bin/env python3
"""
Convert Jupyter notebooks to Astro-compatible markdown posts.

Usage:
    python scripts/convert-notebook.py path/to/notebook.ipynb
"""

import nbformat
from nbconvert import MarkdownExporter
import sys
from pathlib import Path
from datetime import datetime
import shutil

def convert_notebook(notebook_path, output_dir="src/content/posts", images_dir="public/posts"):
    """Convert a Jupyter notebook to a markdown post with frontmatter."""

    # Read the notebook
    with open(notebook_path, 'r') as f:
        nb = nbformat.read(f, as_version=4)

    # Convert to markdown
    exporter = MarkdownExporter()
    body, resources = exporter.from_notebook_node(nb)

    # Get notebook name
    notebook_name = Path(notebook_path).stem

    # Get current date
    current_date = datetime.now().strftime("%Y-%m-%d")

    # Create output paths
    output_path = Path(output_dir) / f"{notebook_name}.md"
    images_output_dir = Path(images_dir) / notebook_name

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

    # Write the markdown
    with open(output_path, 'w') as f:
        # Write frontmatter template
        f.write('---\n')
        f.write(f'title: "{notebook_name.replace("-", " ").replace("_", " ").title()}"\n')
        f.write(f'date: "{current_date}"\n')
        f.write('summary: "Add your summary here"\n')
        f.write('tags: ["jupyter", "notebook"]\n')
        f.write('draft: false\n')
        f.write('---\n\n')
        # Write converted content
        f.write(body)

    print(f"✓ Converted {notebook_path} to {output_path}")
    if 'outputs' in resources and resources['outputs']:
        print(f"✓ Saved {len(resources['outputs'])} images to {images_output_dir}")
    print(f"\n📝 Next steps:")
    print(f"  1. Edit {output_path}")
    print(f"  2. Update the frontmatter (title, summary, tags, etc.)")
    print(f"  3. Review the converted content")
    print(f"  4. Run 'npm run dev' to preview")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/convert-notebook.py <path-to-notebook.ipynb>")
        sys.exit(1)

    notebook_path = sys.argv[1]

    if not Path(notebook_path).exists():
        print(f"Error: File '{notebook_path}' not found")
        sys.exit(1)

    if not notebook_path.endswith('.ipynb'):
        print(f"Error: File must be a Jupyter notebook (.ipynb)")
        sys.exit(1)

    convert_notebook(notebook_path)
