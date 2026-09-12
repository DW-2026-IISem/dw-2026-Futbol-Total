# Motores de bases de datos

## Introducción

En este documento presento los comandos que utilizo para configurar, iniciar y conectarme a mis cuatro motores de bases de datos: Microsoft SQL Server, MySQL, Oracle Database XE y PostgreSQL. También registro las rutas de mis proyectos, los comandos para consultar los contenedores Docker y las instrucciones para acceder a los proyectos de bases de datos y desarrollo web.

Estos comandos forman parte de mi proyecto `Pedalibre - Bicicletas compartidas` y me permiten trabajar de manera organizada con los servicios y los datos persistentes almacenados en `ia-lab`.

## Ubicación

Los archivos de configuración están en:

```text
~/ia-lab/services/motores-bd/
```

Los datos persistentes están en:

```text
~/ia-lab/data/
```

La red Docker compartida que utilizo es `ia-lab-network`.

```bash
docker network inspect ia-lab-network >/dev/null 2>&1 || docker network create ia-lab-network
docker network ls | grep ia-lab
```

---

## 1. Microsoft SQL Server

### Entrar a la carpeta

```bash
cd ~/ia-lab/services/motores-bd/mssql
```

### Iniciar el motor

```bash
sudo docker compose up -d
```

### Ver el estado

```bash
sudo docker ps --filter "name=mssql-server" --format "table {{.Names}}\t{{.Ports}}"
```

### Conectarse desde el contenedor

```bash
sudo docker exec -it mssql-server /opt/mssql-tools18/bin/sqlcmd \
-S localhost -U SA -P 'Pedalibre1704!' -C
```

### Datos de conexión

```text
Servidor: 172.18.50.255
Puerto: 1433
Base de datos: Pedalibre
Usuario administrador: SA
Contraseña de SA: Pedalibre1704!
Usuario remoto: admin
Contraseña de admin: 1704
Edición: Developer
```

---

## 2. MySQL

### Entrar a la carpeta

```bash
cd ~/ia-lab/services/motores-bd/mysql
```

### Iniciar el motor

```bash
sudo docker compose up -d
```

### Conectarse desde el contenedor

```bash
sudo docker exec -it mysql-server mysql -u root -p
```

El comando solicitará la contraseña.

### Datos de conexión

```text
Servidor: 172.18.50.255
Puerto: 3306
Base de datos: Pedalibre
Usuario administrador: root
Contraseña de root: 1704
Usuario remoto: admin
Contraseña de admin: 1704
```

También puedes conectarte desde el host:

```bash
mysql -h 172.18.50.255 -P 3306 -u admin -p Pedalibre
```

Comprobar el estado y la conexión:

```bash
sudo docker ps --filter "name=mysql-server" --format "table {{.Names}}\t{{.Ports}}"
sudo docker exec mysql-server mysqladmin ping -h localhost -u root -p1704
```

Crear un backup:

```bash
sudo docker exec mysql-server mysqldump -u root -p1704 Pedalibre -r /backups/backup_Pedalibre_$(date +%Y%m%d).sql
ls -lh /mnt/d/academia/bd/backup_Pedalibre_$(date +%Y%m%d).sql
```

---

## 3. Oracle Database XE

### Entrar a la carpeta

```bash
cd ~/ia-lab/services/motores-bd/oracle
```

### Iniciar el motor

```bash
sudo docker compose up -d
```

### Conectarse desde el contenedor

```bash
sudo docker exec -it oracle-server sqlplus \
'system/1704@//localhost:1521/Pedalibre'
```

### Datos de conexión

```text
Servidor: 172.18.50.255
Puerto: 1521
Service Name: Pedalibre
Usuario administrador: SYSTEM
Contraseña de SYSTEM: 1704
Usuario del proyecto: admin
Contraseña de admin: 1704

Para conectarse al esquema del proyecto:

```bash
sudo docker exec -it oracle-server bash
sqlplus 'admin/1704@//localhost:1521/Pedalibre'
```

Crear un backup con Oracle Data Pump:

```bash
sudo docker exec oracle-server expdp 'system/1704@//localhost:1521/Pedalibre' directory=DATA_PUMP_DIR dumpfile=backup_Pedalibre.dmp logfile=backup_Pedalibre.log
```
```

---

## 4. PostgreSQL

### Entrar a la carpeta

```bash
cd ~/ia-lab/services/motores-bd/postgres
```

### Iniciar el motor

```bash
sudo docker compose up -d
```

### Conectarse desde el contenedor

```bash
sudo docker exec -it postgres-server psql -U postgres -d Pedalibre
```

### Datos de conexión

```text
Servidor: 172.18.50.255
Puerto: 5432
Base de datos: Pedalibre
Usuario administrador: postgres
Contraseña de postgres: 1704
Usuario remoto: admin
Contraseña de admin: 1704
```

También puedes conectarte desde el host:

```bash
psql -h 172.18.50.255 -p 5432 \
-U admin -d Pedalibre
```

Comprobar el estado y la conexión:

```bash
sudo docker ps --filter "name=postgres-server" --format "table {{.Names}}\t{{.Ports}}"
sudo docker exec postgres-server pg_isready -U postgres -d Pedalibre
```

Crear un backup:

```bash
sudo docker exec postgres-server pg_dump -U postgres -d Pedalibre -f /backups/backup_Pedalibre_$(date +%Y%m%d).sql
ls -lh /mnt/d/academia/bd/backup_Pedalibre_$(date +%Y%m%d).sql
```

---

## Comandos generales

Ver todos los contenedores:

```bash
sudo docker ps -a
```

Ver registros de un motor:

```bash
sudo docker logs mysql-server --tail 30
sudo docker logs postgres-server --tail 30
sudo docker logs mssql-server --tail 30
sudo docker logs oracle-server --tail 30
```

Detener un motor:

```bash
sudo docker compose down
```

Entrar al proyecto de bases de datos:

```bash
cd ~/ia-lab/projecs/"base de datos 2"
```

Entrar al proyecto web:

```bash
cd ~/ia-lab/projecs/"desarrollo web"
```

Ver todos los proyectos:

```bash
tree ~/ia-lab/projecs
```

Consultar la IP actual del equipo para conexiones remotas:

```bash
ip a
```

---

## Firma

**Oscar David Vega Daza**  
Estudiante de Ingeniería de Sistemas  
Facultad de Ingeniería  
Universidad de La Guajira  
Rol: estudiante y responsable de la instalación, configuración y verificación de los cuatro motores  
Docente: Ing. Jaider Quintero M.