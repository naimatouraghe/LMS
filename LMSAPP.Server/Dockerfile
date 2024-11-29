# Image de base pour la compilation
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copie des fichiers projet et restauration des dépendances
COPY ["lmsapp.Server.csproj", "./"]
RUN dotnet restore "lmsapp.Server.csproj"

# Copie du reste des fichiers et compilation
COPY . .
RUN dotnet build "lmsapp.Server.csproj" -c Release -o /app/build

# Publication
FROM build AS publish
RUN dotnet publish "lmsapp.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Image finale
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Configuration des variables d'environnement
ENV ASPNETCORE_URLS=https://+:7002;http://+:7003
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/app/cert/cert.pfx
ENV ASPNETCORE_Kestrel__Certificates__Default__Password=password

# Création du dossier pour les certificats
RUN mkdir -p /app/cert

# Génération d'un certificat de développement
RUN openssl req -x509 -newkey rsa:4096 -keyout /app/cert/key.pem -out /app/cert/cert.pem -days 365 -nodes -subj '/CN=localhost' \
    && openssl pkcs12 -export -out /app/cert/cert.pfx -inkey /app/cert/key.pem -in /app/cert/cert.pem -passout pass:password

EXPOSE 7002 7003
ENTRYPOINT ["dotnet", "lmsapp.Server.dll"]