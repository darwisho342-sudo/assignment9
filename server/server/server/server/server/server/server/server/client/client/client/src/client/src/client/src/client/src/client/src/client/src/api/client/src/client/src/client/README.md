# Reading List

A Web Programming Assignment 9 project. An Express API stores books in memory and a React page uses the API to browse, add, edit, rate and delete them.

## Run locally

Use Node.js 26 LTS and npm. Start the server and client in separate terminals from the repository root.

| Terminal | Commands | Address |
| --- | --- | --- |
| API | `cd server`, `npm install`, `npm run dev` | `http://localhost:3000/api` |
| React | `cd client`, `npm install`, `npm run dev` | `http://localhost:5173` |

The server also supports `npm start`. Copy each `.env.example` to a local `.env` if you need different values.

| Folder | Variable | Default |
| --- | --- | --- |
| `server` | `PORT` | `3000` |
| `server` | `CLIENT_ORIGIN` | `http://localhost:5173` |
| `client` | `VITE_API_URL` | `http://localhost:3000/api` |

Use the exact client origin, including the protocol and port, with no trailing slash. Restart the affected process after changing its environment.

## Files

| Path | Purpose |
| --- | --- |
| `server/index.js` | Middleware, API setup, stats route and JSON errors |
| `server/booksRoutes.js` | Resource routes |
| `server/booksStore.js` and `server/seedBooks.js` | Async in-memory operations and initial data |
| `server/validation.js`, `server/bookQuery.js`, `server/stats.js` | Book validation, list queries and statistics |
| `client/src/api/books.js` | Shared Fetch API client |
| `client/src/App.jsx` | Page state, request cancellation and post-change refresh |
| `client/src/BookForm.jsx`, `BookList.jsx`, `Filters.jsx`, `Stats.jsx` | Form, book rows, list controls and statistics |

The pasted assignment omitted its directory diagram and stats example. This project uses sibling `server/` and `client/` folders and returns stats as `{ total, read, unread, averageRating, byGenre }`, where `byGenre` maps names to counts. `GET /api/crash` deliberately throws to exercise the 500 middleware.

## HTTP evidence to capture

The development environment could not install Express or Vite because it could not reach npm. The following is a reproducible test sequence and the statuses to check. Actual HTTP transcripts and browser observations are pending. Direct Node assertions passed for store operations, validation, duplicate handling, filters, sorting, pagination, and statistics.

Run against a freshly started server. These commands use PowerShell and `curl.exe`. JSON is passed through a file to keep its quotation marks intact on Windows.

```powershell
$api = 'http://localhost:3000/api'
$body = Join-Path ([System.IO.Path]::GetTempPath()) 'reading-list-evidence.json'

curl.exe --include "$api/books?genre=fiction&read=true"
curl.exe --include "$api/books/1"
curl.exe --include "$api/stats"

'{"title":"Assignment Test","author":"Sample Author","year":2001,"genre":"other"}' | Set-Content -Encoding ascii $body
curl.exe --include -H 'Content-Type: application/json' --data-binary "@$body" "$api/books"
curl.exe --include -H 'Content-Type: application/json' --data-binary "@$body" "$api/books"
curl.exe --include "$api/stats"

'{"title":"Invalid","author":"Sample Author","year":999,"genre":"other"}' | Set-Content -Encoding ascii $body
curl.exe --include -H 'Content-Type: application/json' --data-binary "@$body" "$api/books"
curl.exe --include "$api/books?genre=fiction&genre=history"
curl.exe --include "$api/books/999"

'{"title":"Updated Test","author":"Sample Author","year":2002,"genre":"other","read":true}' | Set-Content -Encoding ascii $body
curl.exe --include -X PUT -H 'Content-Type: application/json' --data-binary "@$body" "$api/books/7"
'{"rating":4}' | Set-Content -Encoding ascii $body
curl.exe --include -X PATCH -H 'Content-Type: application/json' --data-binary "@$body" "$api/books/7"
curl.exe --include "$api/stats"

curl.exe --include -X DELETE "$api/books/7"
curl.exe --include -X DELETE "$api/books/7"
curl.exe --include "$api/crash"
```

Expected sequence is 200, 200, 200, 201 with `Location: /api/books/7`, 409, 200, 400, 400, 404, 200, 200, 200, 204 with an empty body, 404, then 500.

For preflight evidence, open the browser's Network tab on the React page, then add a book. Inspect the `OPTIONS /api/books` entry and record its status and response headers. Look for `Access-Control-Allow-Origin: http://localhost:5173`, an `Access-Control-Allow-Methods` value containing POST, and `Access-Control-Allow-Headers` allowing content-type.

## Reasoning questions

1. **Parameters.** An ID selects one resource and gives that book its own address, such as `/api/books/5`. Genre and sort describe the collection view. Moving the ID into the query string would require the collection handler to distinguish a request for one book from a request for a list.
2. **Body parsing.** Experiment pending. Move `app.use(express.json())` below the routes, restart, and run the valid POST above. The expected result is an undefined `req.body` and a 400 response from the object validation.
3. **One response.** Experiment pending. Temporarily add an early missing-book 404 branch to the GET-by-ID handler and let it fall through to a second response by removing its return. The expected failure is a headers-already-sent error because calling `res.json()` does not stop JavaScript execution.
4. **PUT and PATCH.** When rating book 7, sending `{"rating":4}` with PATCH preserves its title, author and other fields. PUT fits a full edit form that submits the complete replacement, where any omitted optional fields go back to their defaults.
5. **CORS.** Experiment pending. Set `CLIENT_ORIGIN=http://localhost:9999`, restart the API and reload the React page. Expect a browser CORS error and blocked JavaScript access to the response, although a simple GET can still reach the server. Use a temporary request logger before CORS to see which requests arrive, and compare with curl, which does not enforce the browser's CORS checks.
6. **Validation.** Anyone can call the API directly with curl or another client and bypass the React form. The server protects the stored records by validating types and rules and returning useful errors.
7. **State.** I added a seventh book in one Node process and loaded the store in a fresh process, which showed the original six seed books. The full server restart experiment is still pending. The array lives in process memory, so retaining changes across restarts would require persistent storage.

Restore any experimental edits before committing.

## Self-study notes

- `URLSearchParams` encodes input before it becomes part of a URL. The client sets each active filter on a query object, so characters such as `&` inside search text stay inside the search value. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- `localeCompare` returns a negative, zero or positive number to indicate string order. The server uses it for title and author, compares numbers directly, and handles null ratings before applying sort direction. [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
- Vite exposes client variables through `import.meta.env`. Only variables with the `VITE_` prefix are exposed by default, so the API address is public configuration and secrets should stay on the server. [Vite](https://vite.dev/guide/env-and-mode)
- Express can send a 204 with `res.status(204).end()`. The fetch helper returns early for that status and skips JSON parsing. [Express 5](https://expressjs.com/en/5x/api.html#res.end)
- An `AbortController` supplies a signal to fetch and aborting can reject fetch or body reading with `AbortError`. The list effect aborts on cleanup and checks its signal before applying results, so rapid filter changes do not leave an old request in control of the page. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#canceling_a_request)

## Implementation challenges

Marking a rated book unread requires sending both the new read status and `rating: null` together. On the server PATCH validates the merged book, so an invalid partial update leaves the stored record untouched. Sorting unrated books last requires handling nulls before reversing the sort direction.