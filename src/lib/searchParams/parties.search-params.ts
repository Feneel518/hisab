import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const partyKindParam = parseAsStringEnum([
  "ALL",
  "CUSTOMER",
  "SUPPLIER",
  "JOBWORKER",
  "OTHER",
] as const).withDefault("ALL");

export const activeParam = parseAsStringEnum([
  "all",
  "true",
  "false",
  "deleted",
] as const).withDefault("all");

export const partiesSearchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  kind: partyKindParam,
  active: activeParam,
  page: parseAsInteger.withDefault(1),
});
