Add-Type -AssemblyName System.Drawing

$images = Get-ChildItem -Path "c:\Users\DELL\Desktop\avidexplores\public" -Include *.jpg,*.jpeg,*.png,*.webp -Recurse

foreach ($image in $images) {
    try {
        $img = [System.Drawing.Image]::FromFile($image.FullName)
        Write-Output "$($image.Name): $($img.Width) x $($img.Height)"
        $img.Dispose()
    }
    catch {
        Write-Output "$($image.Name): Unable to read"
    }
}
