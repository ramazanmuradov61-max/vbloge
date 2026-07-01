param(
  [int]$Port = 5173,
  [string]$HostAddress = "127.0.0.1"
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
}

function Write-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$Reason,
    [byte[]]$Body,
    [string]$ContentType
  )

  $Header = "HTTP/1.1 $Status $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
  $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostAddress), $Port)
$Listener.Start()
Write-Host "Serving $Root at http://${HostAddress}:$Port/"

while ($true) {
  $Client = $Listener.AcceptTcpClient()
  try {
    $Stream = $Client.GetStream()
    $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $RequestLine = $Reader.ReadLine()
    if ([string]::IsNullOrWhiteSpace($RequestLine)) {
      continue
    }

    $Parts = $RequestLine.Split(" ")
    $RawPath = if ($Parts.Length -gt 1) { $Parts[1] } else { "/" }
    $Path = [System.Uri]::UnescapeDataString(($RawPath.Split("?")[0]).TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($Path)) {
      $Path = "index.html"
    }

    $Candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $Path))
    if (-not $Candidate.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
      Write-Response $Stream 403 "Forbidden" $Body "text/plain; charset=utf-8"
      continue
    }

    if (-not [System.IO.File]::Exists($Candidate)) {
      $Candidate = Join-Path $Root "index.html"
    }

    $Extension = [System.IO.Path]::GetExtension($Candidate).ToLowerInvariant()
    $ContentType = if ($MimeTypes.ContainsKey($Extension)) { $MimeTypes[$Extension] } else { "application/octet-stream" }
    $BodyBytes = [System.IO.File]::ReadAllBytes($Candidate)
    Write-Response $Stream 200 "OK" $BodyBytes $ContentType
  } catch {
    $Body = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
    Write-Response $Stream 500 "Internal Server Error" $Body "text/plain; charset=utf-8"
  } finally {
    $Client.Close()
  }
}
