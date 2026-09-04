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
| `!ds-group`        | Helper: ds_group_field(key, label, sub_fields=[], args=[]). |
| `!ds-group-old`    | Legacy array-based ACF Group field.                  |
| `!ds-repeater`     | Helper: ds_repeater_field(key, label, sub_fields=[], args=[]). |
| `!ds-repeater-old` | Legacy array-based ACF Repeater field.               |
| `!ds-flexible-content`| PHP syntax for creating an ACF Flexible Content field. |
| `!ds-link`         | Helper: ds_link_field(key, label).                   |
| `!ds-link-old`     | Legacy array-based ACF Link field.                   |
| `!ds-post-object`  | PHP syntax for creating an ACF Post Object field.    |
| `!ds-number`       | PHP syntax for creating an ACF Number field.         |
| `!ds-email`        | PHP syntax for creating an ACF Email field.          |
| `!ds-message`      | PHP syntax for creating an ACF Message field.        |
| `!ds-cpt`          | PHP syntax for creating an ACF CPT field group.      |
| `!ds-toggle`       | Helper: ds_toggle_field(key, label, args=[]).        |
| `!ds-toggle-old`   | Legacy array-based ACF True/False field.             |
| `!ds-heading-tag`  | PHP syntax for a standalone ACF Heading Tag select field. |
| `!ds-key`          | PHP syntax for creating an ACF Key                   |
| `!ds-fields`       | Auto-generates all `get_sub_field` variable assignments from the matching config file. |
| `!ds-init`         | In a section file: the variable assignments plus the `ds_open_section()` / `ds_close_section()` wrapper. In a config file: the layout array. |

Use these prefixes in your `.php` files to quickly generate ACF field definitions.

## `!ds-init` — Scaffold a config file

Type `!ds-init` in a config file (any PHP file inside a `fields/` directory) to generate the layout array. Variable name, `label` and `name` are prefilled from the file name and the `layout_` key is generated fresh.

**Example output** for `faqs.php`:

```php
<?php

$faqs = array(
    'key' => 'layout_017bb852f15698',
    'label' => 'FAQs',
    'name' => 'faqs',
    'display' => 'block',
    'sub_fields' => array(
        
    ),
    'min' => 0,
    'max' => 0,
);
```

Tab through the editable parts: the variable name comes first — it is mirrored into `'name'`, so both stay in sync — then the label, then the cursor lands inside the empty `sub_fields` array, ready for the field snippets. The `<?php` tag is only inserted when the file does not already have one.

## `!ds-init` — Scaffold a section file

Type `!ds-init` in an empty section PHP file to generate the whole file at once — the same variable assignments as `!ds-fields`, wrapped in a PHP block, followed by the section wrapper. The cursor lands between `ds_open_section()` and `ds_close_section()`, ready for the markup.

**Example output** for `three_col_text.php`:

```php
<?php
    $columns = get_sub_field('columns');
    $icon = ds_get_image_data_from_sub_field('icon');
?>

<?php echo ds_open_section(); ?>

<?php echo ds_close_section(); ?>
```

Unlike `!ds-fields`, `!ds-init` also inserts when no config file exists yet — you get the wrapper with an empty PHP block.

## `!ds-fields` — Auto-generate section variables

Type `!ds-fields` inside a section PHP file and accept the autocomplete suggestion. The extension reads the corresponding config file and generates all `get_sub_field` (or `ds_get_image_data_from_sub_field`) variable assignments in config order.

**Example output:**

```php
$heading = get_sub_field('heading');
$image = ds_get_image_data_from_sub_field('image');
$cropped_image = ds_get_image_data_from_sub_field('cropped_image');
$link = get_sub_field('link');
```

**Which fields are generated:** only the top-level `sub_fields` of the layout. Fields nested inside a repeater, group or flexible content are *not* generated — the containing field itself is, so you can loop over it yourself:

```php
$columns = get_sub_field('columns'); // the flexible content field, not its sub-fields
```

The layout array is the variable named after the file (`cta.php` → `$cta`), matching the convention enforced by `ds_load_acf_layout()`. Helper layout arrays defined earlier in the same file (e.g. `$layouts` for flexible content) are ignored.

**Image detection:** fields that return an attachment ID use `ds_get_image_data_from_sub_field` — the helpers `ds_image_field` / `ds_image_crop_field`, and raw arrays of type `image` / `image_aspect_ratio_crop`. Fields returning the full array (`ds_header_image_field`, or `'return_format' => 'array'`) use `get_sub_field`, since `ds_get_image_data_from_sub_field()` expects an ID.

Skipped entirely: `tab`, `accordion` and `message` fields, which hold no value.

**Name resolution** mirrors `ds_parse_label_to_name()` — the label is used unless the helper's `$args` array overrides it:

```php
ds_text_field('field_5fb8284670d154', 'Section ID', ['name' => 'id']) // → $id = get_sub_field('id');
```

**Path conventions — the extension looks for the config file in two locations:**

| Section file | Config file |
|---|---|
| `theme/page-templates/sections/foo.php` | `theme/config/acf-fields/elements/fields/foo.php` |
| `templates/sections/foo.php` | `templates/fields/foo.php` |

Both raw ACF array format (`'type' => 'image'`) and helper-function format (`ds_image_field(...)`) are supported, mixed in the same file. Outside a `sections/` directory the suggestion never appears; inside one it always appears, and reports in its detail line if the config file is missing or has no parsable fields.

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

/**
 * Create an ACF Group field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param array $sub_fields The sub fields belonging to the group
 * @param array $args Additional arguments
 */
function ds_group_field($key, $label, $sub_fields = [], $args = [])

/**
 * Create an ACF Repeater field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param array $sub_fields The sub fields belonging to the repeater rows
 * @param array $args Additional arguments
 */
function ds_repeater_field($key, $label, $sub_fields = [], $args = [])

/**
 * Create an ACF true/false toggle field using a helper function
 * @param string $key The field key
 * @param string $label The field label
 * @param array $args Additional arguments
 */
function ds_toggle_field($key, $label, $args = [])
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

Version 0.0.6 extends `!ds-init` to config files: it scaffolds the layout array with the variable, `label` and `name` taken from the file name and the cursor inside `sub_fields`.

Version 0.0.5 adds `!ds-init` (full section scaffold) and reworks `!ds-fields`: bracket-aware config parsing, top-level fields only, correct getter for image fields that return an array, and feedback when nothing can be generated.

Version 0.0.4 adds `!ds-fields` — a dynamic completion that auto-generates section variable assignments from the matching ACF config file.

Version 0.0.3 removes unused ACF-fields and adds specific fields for devsolution.

**Enjoy!**
