# Ekmark Watermark API

Use the Ekmark API to apply a text watermark to one or more images and receive
the results as PNG data URLs.

**Base URL:** `https://api.ekmark.ekolix.com.ng`

For the complete user guide, visit the
[Ekmark API documentation](https://ekmark.ekolix.com.ng/documentation).

## Check availability

Send a `GET` request to `/api/watermark`:

```bash
curl https://api.ekmark.ekolix.com.ng/api/watermark
```

## Watermark images

Send a `POST` request to `/api/watermark` as `multipart/form-data`.

| Field | Required | Accepted values |
| --- | --- | --- |
| `images` | Yes | One or more image files, up to 10 files and 2 MiB per file |
| `text` | Yes | Non-empty watermark text, up to 60 characters |
| `fontSize` | Yes | A number from 10 to 120 |
| `position` | Yes | `top-left`, `top-center`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom-center`, or `bottom-right` |

Example:

```bash
curl -X POST https://api.ekmark.ekolix.com.ng/api/watermark \
  -F "images=@photo.jpg" \
  -F "text=© Example" \
  -F "fontSize=32" \
  -F "position=bottom-right"
```

The requested font size scales with image width and is reduced as needed to fit
the image dimensions. Results are PNGs regardless of the source image format.

## Successful response

The response contains one result for each uploaded image:

```json
{
  "images": [
    {
      "id": "generated-uuid",
      "name": "photo.png",
      "url": "data:image/png;base64,..."
    }
  ]
}
```

Use each `url` as a data URL to display or save the processed PNG. The result
name is based on the uploaded filename with a `.png` extension.

## Errors

Errors are returned as JSON with a `success` value of `false` and a
human-readable `message`.

| Status | Meaning |
| --- | --- |
| `400` | Missing or invalid fields, unsupported upload type, or too many images |
| `413` | An image exceeds the 2 MiB per-file limit |
| `500` | An image could not be processed or the service encountered an unexpected error |

## Image handling

Uploads and generated results are processed in memory and are not saved as
files by the API. Requests can process up to 10 images at once. The public
service currently does not require API authentication; use it in accordance
with the [Ekmark Terms of Service](https://ekmark.ekolix.com.ng/terms).
