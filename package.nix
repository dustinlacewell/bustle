{ buildNpmPackage, lib }:
let
  json = lib.importJSON ./package.json;
in
buildNpmPackage {
  pname = "bustle";
  version = json.version + "-git";

  src = lib.sources.sourceFilesBySuffices ./. [
    ".js"
    ".ts"
    ".json"
  ];

  npmDepsHash = "sha256-LVibu7d8xEM1TIZSjlcLbpGh7lmrP+wkUwE06v4UG58=";

  meta = {
    mainProgram = "bustle";
  };
}
