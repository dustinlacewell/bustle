[Setup]
AppName=YOMI-Bustle
AppVersion=1.0.0
DefaultDirName={pf}\YOMI-Bustle
UninstallDisplayIcon={app}\bustle.exe
OutputBaseFilename=BustleInstaller
OutputDir=..\dist\win
Compression=lzma
SolidCompression=yes

[Files]
Source: "..\dist\win\bustle.exe"; DestDir: "{app}"; Flags: ignoreversion

[Code]
type
  WPARAM = UINT;
  LPARAM = LongInt;
  
const
  WM_SETTINGCHANGE = $001A;
  SMTO_ABORTIFHUNG = $0002;

function SendMessageTimeout(hWnd: HWND; Msg: UINT; wParam: WPARAM;
  lParam: PAnsiChar; fuFlags, uTimeout: UINT; var lpdwResult: DWORD): UINT;
  external 'SendMessageTimeoutA@user32.dll stdcall';

// Splits a string into an array using the given delimiter
procedure Explode(Separator: String; Text: String; var Dest: TArrayOfString);
var
  i, p: Integer;
begin
  i := 0;
  SetArrayLength(Dest, 0);
  p := Pos(Separator, Text);
  while p > 0 do begin
    SetArrayLength(Dest, i + 1);
    Dest[i] := Copy(Text, 1, p - 1);
    Text := Copy(Text, p + Length(Separator), Length(Text));
    p := Pos(Separator, Text);
    i := i + 1;
  end;
  SetArrayLength(Dest, i + 1);
  Dest[i] := Text;
end;

function NeedsAddToPath(): Boolean;
var
  PathEnv: string;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', PathEnv) then
    PathEnv := '';
  Result := Pos(ExpandConstant('{app}'), PathEnv) = 0;
end;

procedure AddToPath();
var
  OldPath, NewPath: string;
  ResultCode: DWORD;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OldPath) then
    OldPath := '';
  NewPath := OldPath + ';' + ExpandConstant('{app}');
  RegWriteStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', NewPath);
  SendMessageTimeout($FFFF, WM_SETTINGCHANGE, 0,
    'Environment', SMTO_ABORTIFHUNG, 5000, ResultCode);
end;

procedure RemoveFromPath();
var
  OldPath, NewPath, AppPath: string;
  i: Integer;
  Parts: TArrayOfString;
  ResultCode: DWORD;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OldPath) then
    exit;
  AppPath := ExpandConstant('{app}');
  Explode(';', OldPath, Parts);
  NewPath := '';
  for i := 0 to GetArrayLength(Parts)-1 do begin
    if Trim(Parts[i]) <> AppPath then
      NewPath := NewPath + Parts[i] + ';';
  end;
  if (Length(NewPath) > 0) and (NewPath[Length(NewPath)] = ';') then
    SetLength(NewPath, Length(NewPath)-1);
  RegWriteStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', NewPath);
  SendMessageTimeout($FFFF, WM_SETTINGCHANGE, 0,
    'Environment', SMTO_ABORTIFHUNG, 5000, ResultCode);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep = ssPostInstall) and NeedsAddToPath() then
    AddToPath();
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
    RemoveFromPath();
end;