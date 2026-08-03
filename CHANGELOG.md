# Change Log

All notable changes to the "acf-vs" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.5]

### Changed

- `!ds-fields` now resolves the layout array by file name and only generates **top-level** fields — repeaters, groups and flexible content yield the containing field, never their nested sub-fields.
- Fields returning a full image array (`ds_header_image_field`, `'return_format' => 'array'`) use `get_sub_field` instead of `ds_get_image_data_from_sub_field`.
- Config parsing is bracket-aware: commas, brackets and helper calls inside strings and comments no longer confuse the parser.
- `'name'` overrides in a helper's `$args` array are respected.
- The suggestion now reports why nothing could be generated instead of silently disappearing.

## [0.0.4]

### Added

- ACF Image Crop

### Changed

- Removed unused fields
