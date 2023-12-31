# thymeleaf-navigate README

A VS Code extension to navigate Thymeleaf 3 fragments. Currently, only HTML files with .html extension are supported.

## Features

Fragment definitions like `<div th:fragment="card-skeleton">` are recognized in HTML files.
Fragment expressions referencing those definitions like
`<div th:replace="~{fragments/skeletons :: card-skeleton}" />` are then recognized and made navigable via
`Ctrl+Click`.

## Requirements

Thymeleaf syntax before version 3 is not supported. Fragments must be located below src/main/resources/templates to be found.

## Extension Settings

No settings supported currently, future versions will allow settings for language/file extension and fragment path.

## Known Issues

Fragment links to files not opened before might not navigate to the fragment definition's line on the first time.

Fragment selectors using CSS selectors like `<div th:insert="~{footer :: #copy-section}" />` are not supported.

Dynamic fragment selectors like `<div th:insert="~{footer :: #{footer.admin}}" />` are not supported.

## Release Notes

### 1.0.0

Initial release
