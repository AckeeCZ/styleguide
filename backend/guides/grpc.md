# ↔️ gRPC styleguide

## 📐 Design conventions

- Always use custom request / response object even if it should be empty (the only exception is `Delete`, which returns `google.protobuf.Empty`) [📑](https://cloud.google.com/apis/design/design_patterns#empty_responses)
- In each protofile define package and java package [📑](https://cloud.google.com/apis/design/naming_convention#package_names), e.g.

```proto
package ackee.newapp.v1;
option java_package = "cz.ackee.newapp.v1";
```

- Prefer unary messages with repeated messages to streams (implementation of flow control is not mature enough)

### Metadata

Since there is no gRPC standard for metadata, treat it as HTTP headers. Analogy is accurate since both client and server can send receive metadata with each call.

Use metadata for data that can be generally applicable to all (most) calls - authentication, language, tracking information etc.

When using server-sent metadata, prefer initial to trailing. Since we use only unary calls, we don't need the distinction, and we faced issues with trailing metadata in combination with Envoy proxy.


### Different shapes of message

If you want to create few types of the same message (e.g. bare on list, rich on detail), don't create new messages! [📑](https://cloud.google.com/apis/design/naming_convention#message_names) Define the message as its largest subset of fields and go for either of...

1. Create a loose contract about sending this and that (verbally, documented)
2. Use defined [resource views 📑](https://cloud.google.com/apis/design/design_patterns#resource_view) to inform client what shape is returned

### Pagination
1. Prefer `next_page_token` and `page_token` to other forms of pagination. It allows to change the pagination logic without changes in the clients
2. Prefer `total_size` field in response to storing this information in metadata

## 🌳 Directory structure [📑](https://cloud.google.com/apis/design/directory_structure)

```bash
api/ # root of your api specs
├── v1/ # API v1 services
│   ├── blog.proto  # | Service per file:
│   ├── topic.proto # | - service interface and rpc methods
│   ├── user.proto  # | - all request response messages, nothing else
│   └── topic.proto # | - e.g. `service Blog`, `service Topic`, etc.
└── type/ # shared messages, types: Proto per distinct message
    ├── article.proto # `message Article` used by multiple services
    └── topic.proto   # `message Topic` used only in topic service
```

1. `Types` once published shouldn't be removed
2. All proto files in `v*` should contain
    - Single service interface (`service Blog`)
    - All related request response message types
    - No other type definitions (move them to `types`)

## 🔤 Naming conventions


### Service

1. Don't use `Service` suffix [📑](https://cloud.google.com/apis/design/naming_convention#interface_names)
2. If name corresponds to an entity name, use singular form

### Method

Prefer standard method names where applicable, however if your use case is not a good fit, consider creating a custom method.

#### Standard methods [📑](https://cloud.google.com/apis/design/standard_methods)

| Method | Should return                                            |
| ------ | -------------------------------------------------------- |
| List   | _Resource\* list_ (regardless of repeated unary/stream) |
| Get    | _Resource\*_                                             |
| Create | _Resource\*_                                             |
| Update | _Resource\*_                                             |
| Delete | _google.protobuf.Empty_ / _Resource\*_ / _Result info_   |

- Returned resources can be only partial if masking applied
- Delete should return non-empty if not deleted completely (updated resource) or immediately (scheduled task, info).

#### Custom methods [📑](https://cloud.google.com/apis/design/custom_methods)

- If not sure wether to use custom methods, check [use cases 📑](https://cloud.google.com/apis/design/custom_methods#use_cases)
- Before creating custom methods, check [common custom methods 📑](https://cloud.google.com/apis/design/custom_methods#common_custom_methods)

#### Messages

1. When creating a new message prefer [standard fields 📑](https://cloud.google.com/apis/design/standard_fields) for attributes
2. For time related use `google.protobuf.Timestamp` (suffix attribute `_time`) and `google.protobuf.Duration`
3. For request, response messages, use `Request`, `Response` suffix, unless `google.protobuf.Empty`
4. For repeated fields, use plural

#### Enums [📑](https://cloud.google.com/apis/design/naming_convention#enum_names)

For default case, use 0 and use the following convention with `_UNSPECIFIED`

```proto
enum FooBar {
  // The first value represents the default and must be == 0.
  FOO_BAR_UNSPECIFIED = 0;
  FIRST_VALUE = 1;
  SECOND_VALUE = 2;
}
```

## 👀 Example
`api/type/article.proto`
```proto
syntax = "proto3";

package ackee.foobar

import "google/protobuf/timestamp.proto";

option java_package = "cz.ackee.foobar"

message Article {
    int32 id = 1;
    string title = 2;
    string description = 3;
    google.protobuf.Timestamp publish_time = 4;
}
```

`api/v1/blog.proto`
```proto
syntax = "proto3";

package ackee.foobar.v1

import "../types/article.proto";

option java_package = "cz.ackee.foobar.v1";

message GetArticleRequest {
    int32 id = 1;
}

message GetArticleResponse {
    Article article = 1;
}

message ListArticlesRequest {
    string page_token = 1;
    // Search in title & description
    string query = 2;
}

message ListArticlesResponse {
    repeated Article article = 1;
    string next_page_token = 2;
}

service Blog {
    rpc GetArticle (GetArticleRequest) returns (GetArticleResponse) {}
    rpc ListArticles (ListArticlesRequest) returns (ListArticlesResponse) {}
}

```
