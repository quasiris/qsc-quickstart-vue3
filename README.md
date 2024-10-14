# qsc-quickstart-vue3

## Overview

This is a configurable e-commerce template built with Vue.js 3 and Vuetify 3, designed for rapid integration with various e-commerce APIs. The template is flexible and allows users to easily customize its behavior through a configuration file (`config.json`). This project helps you set up an online shop quickly by configuring endpoints and templates in a Vue.js environment.

## Project Setup

install dependencies, compile, and run the project, follow these commands:

### Install dependencies
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration

The main configuration file for this project is config.json, where you can specify various API URLs and display settings.

### Example config.json

```
[
  {
    "id": "1",
    "baseurl": "https://qsc-dev.quasiris.de/api/v1/search/demo/trendware",
    "suggestionUrl": "https://qsc-dev.quasiris.de/api/v1/search/suggest/demo/trendware?q=",
    "sortimentUrl": "https://qsc-dev.quasiris.de/api/v1/category/demo/navigation-random",
    "resultSetId": "trendware",
    "logo": "https://qsc.quasiris.de/cdn/qsc/demo/trendware/shop/img/logo.png",
    "document": {
      "name": "title",
      "url": "url",
      "image": "image"
    },
    "rows": [
      { "id": 24, "name": "24 records" },
      { "id": 48, "name": "48 records" },
      { "id": 72, "name": "72 records" }
    ]
  },
  {
    "id": "trendware-error-testing",
    "baseurl": "https://qsc-dev.quasiris.de/api/v1/search/demo/trendware-error-testing",
    "suggestionUrl": "https://qsc-dev.quasiris.de/api/v1/search/suggest/demo/trendware-error-testing?q=",
    "sortimentUrl": "https://qsc-dev.quasiris.de/api/v1/category/demo/navigation-random",
    "resultSetId": "trendware-error-testing",
    "logo": "https://qsc.quasiris.de/cdn/qsc/demo/trendware/shop/img/logo.png",
    "document": {
      "name": "${title} : ${price}",
      "url": "url",
      "image": "image",
      "template": "<div class='card'><a :href='config.url'>{{config.name}}</a></div>"
    },
    "rows": [
      { "id": 24, "name": "24 records" },
      { "id": 48, "name": "48 records" },
      { "id": 72, "name": "72 records" }
    ]
  }
]
```

###  Key Configuration Fields

    id: A unique identifier for the configuration.
    baseurl: API endpoint for fetching product data. (Required)
    suggestionUrl: API endpoint for search bar suggestions. (Required)
    sortimentUrl: API endpoint for the sortiment navigation. If this is missing, the navigation will not appear.
    resultSetId: Identifier for the result set in the API response. This is critical for rendering the results. (Required)
    logo: URL of your shop logo. (Required)
    document: Object containing keys such as:
        name: This will be the product title displayed in the UI.
        url: URL of the product page.
        image: URL of the product image.
        template: Optional Vue.js template for customizing product card display.
    rows: Defines the number of records displayed per page. If omitted, default values will be used.

### Screenshots

Here are a few screenshots to help visualize how the project looks when running. Replace the paths with actual image links:

![Alt text](src/assets/Screenshot1.png)
![Alt text](src/assets/Screenshot2.png)
![Alt text](src/assets/Screenshot4.png)
![Alt text](src/assets/Screenshot3.png)

### How to Use the Configuration

    Modify API URLs: Update baseurl, suggestionUrl, and sortimentUrl to point to your own API endpoints.
    Customize Product Display: Update the document object to map API response fields to your desired display configuration.
    Use Custom Templates: If you want custom UI layouts, add a Vue.js template field to the document object.

For example, to configure the product name and price display:
```
{
  "document": {
    "name": "${title} : ${price}",
    "url": "url",
    "image": "image",
    "template": "<div class='product-card'><a :href='config.url'>{{config.name}}</a></div>"
  }
}
```
This template will display the product name and price as the card title.

### Vue.js Integration

This project is built with Vue.js 3, allowing easy integration of reactive components. You can modify the components or extend them as needed. The config.json helps you control what data is shown without modifying the core Vue.js code.

### Example API Response

Here’s a simplified example of what the API response from the baseurl might look like:
```
{
  "data": {
    "resultSetId": "trendware",
    "products": [
      {
        "title": "Product 1",
        "price": "$29.99",
        "url": "https://example.com/product/1",
        "image": "https://example.com/product1.jpg"
      }
    ]
  }
}
```