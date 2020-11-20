## REST design

Example resource: User.

### Resource naming

1. Resource names are always in plural
2. Resource strictly alternate resource-name and resource-id

**Example 1**: `/users`
**Example 2**: `/users/{userId}/addresses/{addressId}`

### Versioning

All endpoints are versioned in URL: `/api/{version}/users`.
**Example**: `/api/v1/users`

### CRUD - Basic operations

- list

        GET /api/v1/users
        
    - results an array of a items same as in the detail with some attributes omitted

- create

        POST /api/v1/users
        
        {"name":"John"}
        
    - results the same as the detail
    
- detail
    
        GET /api/v1/users/{userId}

- update

        PUT /api/v1/users/{userId}
        
        {"name":"John"}

    - results the same as the detail
    - does not behave as replace - if any attributes are omitted, previous are kept
        
        
### List filtering

Filtering is made through query. If query is large, filters are sent in a body to a different endpoint.

- exact match filtering

        ?foo=bar&fiz=baz
        
- less than / greater than
        
        
        ?age=>25

### Setting relations

In many cases you want to a resource to return reference object / array of objects.

        { car: { ... }, addresses: [ { ... } ] }
        
To create/update those, send id correspoding id attributes

        { carId: X, addressIds: [ X, Y, Z ] }
        
### Setting relations directly

Sometimes you want to create a relation directly. Everything is a resource, therefore you need to manipulate a resource for the reference.

    POST /user-blocked-books

    {
        userId: 1,
        bookId: 3
    }
    
According to [The Upsert](#the-upsert), this operation is a create or update of entity defined by the identifiers.
    

        
### Request variables

A commonly used pattern in resource naming are wildcards replaced from the current request data.

- a user resource where resource-id is replaced from the authentication session

        /api/v1/users/me

- similar usage in a query parameter filter

        /api/v1/vehicles?userId=me
        
- we advice agains using these replacements in the request payload
        
### Bulk create

A careful consideration lead to a following result:
- Create accepts also an array.
- If used as such, create returns a corresponding array.
- This is considered an atomic operation, whether all are created or none is.


        POST [ { ... }, { ...} ]
        
        200 OK
        [ { ... }, { ... } ]

### Bulk update

    PATCH /api/v1/books/{bookId}/pages
    
    [
        { id: 1, tornOut: 3 },
        { id: 3, author: 1 }
    ]

### Bulk constant update

Update `n` records with the same data.

    PATCH /api/v1/book/{bookId}/pages
    
    {
        data: { tornOut: true }
        pages: [1, 3, 52]
    }

### The Upsert

Common REST does not specify how to do an the upsert = an operation that creates or updates a resource.

    POST /api/v1/reviews

    {
        userId: 1,
        eventId: 3
    }

### Preset data for new resource

Assume you want to prefill form data for new entity: e.g. fetch next identifier number deduced from global series, or send defaults.

- Use `GET` on the resource detail with special id `next`. This will return partial data of the resource (those you want to prefill).
- Do not modify attribute names (if sending `number`, return `number`, not `nextNumber` or whatnot)

**Example**

Prefill `expenseNumber` on resource `expenses`.

```json
GET /api/v1/expenses/next
```

```json
200 OK
{
    "expenseNumber": "N-2019-05-0036",
}
```

Client fetches the next data, and creates a resource with data based on the values provided.

```json
POST /api/v1/expenses
{
    "expenseNumber": "N-2019-05-0036",
    "price": 42
}
```

```json
201 Created
{
    "id": 1,
    "expenseNumber": "N-2019-05-0036",
    "price": 42
}
```

Beware that client may change the payload or send outdated data.

## References
- [Best practices](https://hackmd.io/cHc9QsSYQayL_e4ySq6SoA?view)
- [Backend guidelines](https://hackmd.io/raAMAkYxQrOPgbUtyQ6Jmw?view)