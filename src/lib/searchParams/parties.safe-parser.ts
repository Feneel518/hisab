import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";

export const kindParser = parseAsStringEnum([
  "ALL",
  "CUSTOMER",
  "SUPPLIER",
  "JOBWORKER",
  "OTHER",
] as const).withDefault("ALL");

export const activeParser = parseAsStringEnum([
  "all",
  "true",
  "false",
  "deleted",
] as const).withDefault("all");

export const partiesParsers = {
  q: parseAsString.withDefault(""),
  kind: kindParser,
  active: activeParser,
  page: parseAsInteger.withDefault(1),
};
