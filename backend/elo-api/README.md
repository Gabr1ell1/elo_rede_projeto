# mentalink-api

## Rodar
mvn spring-boot:run  (ou ./mvnw se tiver o wrapper)

Sobe em http://localhost:8081

## Testar (mesmo estilo dos testes do Pokémon)

curl -X POST http://localhost:8081/auth/v1/register -H "Content-Type: application/json" -d "{\"username\":\"gabi\",\"email\":\"gabi@teste.com\",\"password\":\"123456\",\"role\":\"PATIENT\"}"

curl -v -X POST http://localhost:8081/auth/v1/auth -H "Content-Type: application/json" -d "{\"username\":\"gabi\",\"password\":\"123456\"}" -c cookies.txt

curl -v http://localhost:8081/auth/v1/me -b cookies.txt
