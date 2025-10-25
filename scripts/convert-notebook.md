# Converting Jupyter Notebooks to Posts

This site uses Astro with markdown-based content collections. To add a Jupyter notebook as a post, you'll need to convert it to markdown first.

## Quick Method (Recommended)

Use `jupyter nbconvert` to convert your notebook:

```bash
# Install nbconvert if you don't have it
pip install nbconvert

# Convert notebook to markdown
jupyter nbconvert --to markdown your-notebook.ipynb --output-dir=src/content/posts

# The output will be: src/content/posts/your-notebook.md
```

Then add frontmatter to the top of the generated markdown file:

```yaml
---
title: "Your Notebook Title"
date: "2024-01-15"
summary: "Brief description of your notebook"
tags: ["jupyter", "python", "data-science"]
draft: false
---
```

## Alternative: Python Script

You can also use this Python script to automate the conversion:

```python
import nbformat
from nbconvert import MarkdownExporter
import sys
from pathlib import Path

def convert_notebook(notebook_path, output_dir="src/content/posts"):
    # Read the notebook
    with open(notebook_path, 'r') as f:
        nb = nbformat.read(f, as_version=4)

    # Convert to markdown
    exporter = MarkdownExporter()
    body, resources = exporter.from_notebook_node(nb)

    # Get notebook name
    notebook_name = Path(notebook_path).stem

    # Create output path
    output_path = Path(output_dir) / f"{notebook_name}.md"

    # Write the markdown
    with open(output_path, 'w') as f:
        # Write frontmatter template
        f.write('---\n')
        f.write(f'title: "{notebook_name}"\n')
        f.write('date: "2024-01-15"\n')
        f.write('summary: "Add your summary here"\n')
        f.write('tags: ["jupyter", "notebook"]\n')
        f.write('draft: false\n')
        f.write('---\n\n')
        # Write converted content
        f.write(body)

    print(f"✓ Converted {notebook_path} to {output_path}")
    print(f"  Don't forget to update the frontmatter!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert-notebook.py <path-to-notebook.ipynb>")
        sys.exit(1)

    convert_notebook(sys.argv[1])
```

Save this as `scripts/convert-notebook.py` and run:

```bash
python scripts/convert-notebook.py path/to/your/notebook.ipynb
```

## Styling Notebooks

The site already has styles for:
- Code blocks (with collapsible functionality)
- Math equations (via KaTeX)
- Tables, lists, and blockquotes

Your notebook content will automatically be styled to match the research notebook aesthetic.
