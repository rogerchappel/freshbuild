# Examples

## One-Shot Proof

```sh
npx freshbuild run --changed src/index.ts --changed tests/index.test.ts
```

## Explicit Script

```sh
npx freshbuild run --script test
```

## Custom Safe Script

```sh
npx freshbuild run --allow verify --script verify
```

## Watch Mode

```sh
npx freshbuild watch --script test --out .freshbuild
```

## Fixture Smoke

```sh
npm run smoke
```
