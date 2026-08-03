# ds-acf-snippets README

Welcome to ds-acf-snippets, a VS Code Extension with shorthand syntax to register ACF fields via PHP. This project is a fork of [acf-snippets](https://github.com/GustavoGomez092/acf-snippets/tree/main).

## Available Snippets

ds-acf-snippets allows you to access all existing ACF fields via the `!ds-` shorthand syntax.

> Tip: These snippets only work on PHP files, Make sure you are within a PHP context when looking for these snippets.

Below is a list of available snippets provided by the `ds-acf-snippets` extension, along with their descriptions:

| **Prefix**         | **Description**                                      |
|---------------------|-----------------------------------------------------|
| `!ds-layout`       | PHP syntax for creating an ACF Layout.               |
| `!ds-heading-wysiwyg`| Helper: ds_heading_wysiwyg_field(key, label, 'basic', 'h2'). |
| `!ds-heading-textarea`| Helper: ds_heading_textarea_field(key, label, default_tag='h2'). |
| `!ds-heading`      | Helper: ds_heading_field(key, label, default_tag='h2'). |
| `!ds-heading-old`  | Legacy array-based ACF Heading field.                |
| `!ds-subheading`   | Helper: ds_heading_field(key, label, default_tag='h3'). |
| `!ds-subheading-old`| Legacy array-based ACF Sub Heading field.           |
| `!ds-text`         | Helper: ds_text_field(key, label, args={}).          |
| `!ds-text-old`     | Legacy array-based ACF Text field.                   |
| `!ds-wysiwyg`      | Helper: ds_wysiwyg_field(key, label, 'basic', 0, {}). |
| `!ds-wysiwyg-old`  | Legacy array-based ACF WYSIWYG field.                |
| `!ds-textarea`     | Helper: ds_textarea_field(key, label, rows=4, args={}). |
| `!ds-textarea-old` | Legacy array-based ACF Text Area field.              |
| `!ds-select`       | PHP syntax for creating an ACF Select field.         |
| `!ds-header-image` | Helper: ds_header_image_field(key, label).           |
| `!ds-image`        | Helper: ds_image_field(key, label).                  |
| `!ds-image-old`    | Legacy array-based ACF Image field.                  |
| `!ds-media`        | Helper: ds_media_field(key, label).                  |
| `!ds-media-crop`   | Helper: ds_media_crop_field(key, label, width=1, height=1). |
| `!ds-video`        | Helper: ds_video_field(key, label).                  |
| `!ds-video-old`    | Legacy array-based ACF Video field.                  |
| `!ds-image-crop`   | Helper: ds_image_crop_field(key, label, width=1, height=1). |
| `!ds-image-crop-old`| Legacy array-based ACF Image Crop field.            |
| `!ds-repeater`     | PHP syntax for creating an ACF Repeater field.       |
| `!ds-flexible-content`| PHP syntax for creating an ACF Flexible Content field. |
| `!ds-link`         | Helper: ds_link_field(key, label).                   |
| `!ds-link-old`     | Legacy array-based ACF Link field.                   |
| `!ds-post-object`  | PHP syntax for creating an ACF Post Object field.    |
| `!ds-number`       | PHP syntax for creating an ACF Number field.         |
| `!ds-email`        | PHP syntax for creating an ACF Email field.          |
| `!ds-message`      | PHP syntax for creating an ACF Message field.        |
| `!ds-cpt`          | PHP syntax for creating an ACF CPT field group.      |
| `!ds-toggle`       | PHP syntax for creating an ACF True/False field.     |
| `!ds-key`          | PHP syntax for creating an ACF Key                   |

| `!ds-fields`       | Auto-generates all `get_sub_field` variable assignments from the matching config file. |

Use these prefixes in your `.php` files to quickly generate ACF field definitions.

## `!ds-fields` — Auto-generate section variables

Type `!ds-fields` inside a section PHP file and accept the autocomplete suggestion. The extension reads the corresponding config file and generates all `get_sub_field` (or `ds_get_image_data_from_sub_field`) variable assignments in config order.

**Example output:**

```php
$heading = get_sub_field('heading');
$image = ds_get_image_data_from_sub_field('image');
$cropped_image = ds_get_image_data_from_sub_field('cropped_image');
$link = get_sub_field('link');
```

**Image detection:** any field whose helper function name or ACF type contains `image` uses `ds_get_image_data_from_sub_field`. All others use `get_sub_field`.

**Path conventions — the extension looks for the config file in two locations:**

| Section file | Config file |
|---|---|
| `templates/sections/foo.php` | `templates/fields/foo.php` |
| `theme/page-templates/sections/foo.php` | `theme/config/acf-fields/elements/fields/foo.php` |

Both raw ACF array format (`'type' => 'image'`) and helper-function format (`ds_image_field(...)`) are supported. If no matching config file is found the suggestion simply does not appear.

## Function Signatures

The following helper functions are available for use in your ACF field definitions:

```php
/**
 * Create an ACF Text field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param array $args Additional arguments
 */
function ds_text_field($key, $label, $args = [])

/**
 * Create an ACF WYSIWYG field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param string $toolbar The toolbar style ('basic' or 'full')
 * @param int $media_upload Whether to enable media upload (0 or 1)
 * @param array $args Additional arguments
 */
function ds_wysiwyg_field($key, $label, $toolbar = 'basic', $media_upload = 0, $args = [])

/**
 * Create an ACF Text Area field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param int $rows Number of rows
 * @param array $args Additional arguments
 */
function ds_textarea_field($key, $label, $rows = 4, $args = [])

/**
 * Create an ACF Heading Textarea field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param string $default_tag The default heading tag (e.g. 'h2')
 * @param array $args Additional arguments
 */
function ds_heading_textarea_field($key, $label, $default_tag = 'h2', $args = [])
```

### Usage Examples

```php
// Text field
ds_text_field('field_abc123', 'My Text Field');

// WYSIWYG field with full toolbar and media upload enabled
ds_wysiwyg_field('field_def456', 'My WYSIWYG', 'full', 1);

// Text Area with custom rows
ds_textarea_field('field_ghi789', 'My Text Area', 6);
```

## Installation

1. Clone the project
2. Install the extension: ```yarn install-extension```

This creates a ```.vsix``` file from the extension and adds it to the installed extensions. To uninstall it, visit the market place.

## Changelog

Version 0.0.4 adds `!ds-fields` — a dynamic completion that auto-generates section variable assignments from the matching ACF config file.

Version 0.0.3 removes unused ACF-fields and adds specific fields for devsolution.

**Enjoy!**
