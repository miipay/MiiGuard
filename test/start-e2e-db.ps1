# load the test env file
Get-Content .env.test.local | ForEach-Object {
    if ($_ -and $_ -notlike '#*') {
        $name, $value = $_.split('=')
        Set-Content env:\$name $value
    }
}
# start testing db
docker run -d --name testing-db -e MARIADB_ROOT_PASSWORD="$env:DB_PASSWORD" -e MYSQL_DATABASE="$env:DB_DATABASE" -p "$env:DB_PORT`:3306" mariadb:latest
Write-Output "wait 5s for DB startup"
Start-Sleep -Seconds 5
