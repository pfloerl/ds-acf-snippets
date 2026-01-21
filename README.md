# ds-acf-snippets README

Welcome to ds-acf-snippets, a VS Code Extension with shorthand syntax to register ACF fields via PHP. This project is a fork of [acf-snippets](https://github.com/GustavoGomez092/acf-snippets/tree/main).

## Available Snippets

ds-acf-snippets allows you to access all existing ACF fields via the `!ds-` shorthand syntax.

> Tip: These snippets only work on PHP files, Make sure you are within a PHP context when looking for these snippets.

Below is a list of available snippets provided by the `ds-acf-snippets` extension, along with their descriptions:

| **Prefix**         | **Description**                                      |
|---------------------|-----------------------------------------------------|
| `!ds-layout`       | PHP syntax for creating an ACF Layout.               |
| `!ds-heading`      | Helper: ds_heading_field(key, label, default_tag='h2'). |
| `!ds-heading-old`  | Legacy array-based ACF Heading field.                |
| `!ds-subheading`   | Helper: ds_heading_field(key, label, default_tag='h3'). |
| `!ds-subheading-old`| Legacy array-based ACF Sub Heading field.           |
| `!ds-text`         | PHP syntax for creating an ACF Text field.           |
| `!ds-wysiwyg`      | PHP syntax for creating an ACF WYSIWYG field.        |
| `!ds-textarea`     | PHP syntax for creating an ACF Text Area field.      |
| `!ds-select`       | PHP syntax for creating an ACF Select field.         |
| `!ds-image`        | Helper: ds_image_field(key, label).                  |
| `!ds-image-old`    | Legacy array-based ACF Image field.                  |
| `!ds-video`        | Helper: ds_video_field(key, label).                  |
| `!ds-video-old`    | Legacy array-based ACF Video field.                  |
| `!ds-image-crop`   | Helper: ds_image_crop_field(key, label, width=1, height=1). |
| `!ds-image-crop-old`| Legacy array-based ACF Image Crop field.            |
| `!ds-repeater`     | PHP syntax for creating an ACF Repeater field.       |
| `!ds-link`         | Helper: ds_link_field(key, label).                   |
| `!ds-link-old`     | Legacy array-based ACF Link field.                   |
| `!ds-post-object`  | PHP syntax for creating an ACF Post Object field.    |
| `!ds-number`       | PHP syntax for creating an ACF Number field.         |
| `!ds-email`        | PHP syntax for creating an ACF Email field.          |
| `!ds-message`      | PHP syntax for creating an ACF Message field.        |
| `!ds-cpt`          | PHP syntax for creating an ACF CPT field group.      |
| `!ds-toggle`       | PHP syntax for creating an ACF True/False field.     |
| `!ds-key`          | PHP syntax for creating an ACF Key                   |

Use these prefixes in your `.php` files to quickly generate ACF field definitions.

## Installation

1. Clone the project
2. Install the extension: ```yarn install-extension```

This creates a ```.vsix``` file from the extension and adds it to the installed extensions. To uninstall it, visit the market place.

## Changelog

Version 0.0.3 removes unused ACF-fields and adds specific fields for devsolution.

**Enjoy!**
