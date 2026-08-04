# Arquitectura General del Sistema de Backups

Descripción de alto nivel de la arquitectura de backups que empleamos.

## Principio 3-2-1

Cuando es posible se sigue el [principio 3-2-1](https://objectfirst.com/guides/data-backup/3-2-1-backup-rule-and-strategy/) (tres copias en dos medios distintos con una copia offsite).

- Almacenamiento primario: Se usa cómo primera línea el servicio del proveedor que se esté empleando, cómo el servicio de backups de Linode.
- Almacenamiento secundario: La arquitectura que se describe a continuación mediante Borgmatic.
- Almacenamiento off-site: Anualmente cuando se hace la prueba de restauración se hace una copia de los repositorios a un disco duro externo (con los repositorios cifrados)

## Provisionamiento

La configuración de los backups es parte estándar del provisionamiento de nuevos servidores.

El provisionamiento se realiza mediante playbooks de Ansible, scripts en bash y algunos pasos manuales (cómo subir la clave ssh y crear el repositorio)

El mecanismo que empleamos permite gestionar de forma sencilla configuraciones distintas para cada servidor, cifrar las _passphrase_, ...

## Clientes

Usamos Borg (Borgmatic) para llevar a cabo las copias de seguridad.

En cada cliente (servidor de producción) queda instalado Borgmatic tras el provisionamiento.

La tarea se ejecuta bajo el usuario root, para el que se ha creado una clave SSH específica para Borgmatic (`/root/.ssh/borgmatic`)

Borg cifra y firma los datos antes de que abandonen el servidor de modo que no es necesario confiar en terceros.

## Periodicidad y Retención

Una tarea de cron ejecuta la copia con la periodicidad deseada. Por defecto martes y jueves en horario de madrugada según la zona horaria. Equivalente a un RPO de 4 días (de dos días si sólo se cuentan laborables)

```yaml
borgmatic_timer_cron_expression: "30 1 * * 2,4"
```

Cuando se configura el provisionamiento se intenta que los backups en los servidores sean escalonados para evitar presionar al alojamiento, sobre todo durante los `checks`.

La política de retención se controla directamente a través de la configuración de Borgmatic y la operación de compactación en el almacenamiento.

Por defecto, mantenemos copia de los tres últimos días, las tres últimas semanas, los tres últimos meses y los tres últimos años.

```yml
# A pesar del nombre `keep_daily` no se refiere a días, si no a últimas copias. Con
# `borg_keep_daily: 3` y un cron de lunes a viernes (`0 22 * * 1-5`), el martes por la
# mañana estarán almacenadas las copias del lunes, viernes y jueves
borg_keep_daily: 3
borg_keep_weekly: 3
borg_keep_monthly: 3
borg_keep_yearly: 3
```

## Verificación

La verificación de los backups se lleva a cabo mediante la herramienta de [check](https://borgbackup.readthedocs.io/en/stable/usage/check.html), la periodicidad y profundidad se configura para cada caso. Habitualmente:

```yml
# https://torsion.org/borgmatic/docs/how-to/deal-with-very-large-backups/
borgmatic_checks:
  - name: repository
    frequency: "4 weeks"
  - name: archives
    frequency: "6 weeks"
  - name: spot
    frequency: "always"
    count_tolerance_percentage: 10
    data_sample_percentage: 1
    data_tolerance_percentage: 0.5
  - name: data
    frequency: "6 months"
#   Handled as a manual restoration test
#   - name: extract
#     frequency: "always"

borgmatic_check_last: 3
```

## Alojamiento de las copias

Usamos [BorgBase](https://www.borgbase.com/) para almacenar las copias de seguridad.

La mayoría de servidores estén bajo una única cuenta, con un repositorio distinto para cada servidor.

A cada repositorio se añaden dos claves públicas SSH, la del servidor y una de _mantenimiento_. Sólo se añaden con permisos _append-only_. Un atacante que obtenga acceso al servidor en producción no puede modificar los backups.

Todas las operaciones de _edición_ en BorgBase (compactar repositorios, añadir claves o repositorios, ...) se realizan únicamente a través de la interfaz web. Esto disminuye la operatividad pero también los vectores de ataque.

Los datos de acceso a la cuenta de BorgBase están aislados del resto de credenciales y sólo el personal mínimo imprescindible tiene acceso a ellos.

La dependencia del proveedor es reducida. Se puede emplear otro servicio (rsync.net, Hetzner), un VPS, o `on-premises` (NAS, ...). Lleva con exportar el repositorio y cambiar el fichero de configuración de Borgmatic.

## Monitorización y Alertas

Empleamos la integración de Borgmatic con el servicio [healthcheck.io](https://healthcheck.io/) para las alertas.

Cuando una copia no se realiza con la periodicidad establecida o existe un error en cualquier punto del proceso (arrancar los servicios, verificación, ...) una alerta por correo-e llega al equipo.

En healthcheck almacenamos un log de cada tarea con la información más relevante.

Cada servidor está configurado con su propia alerta en una cuenta común.

La dependencia del proveedor es reducida. Se trata de una aplicación de software libre con una capa gratuita, que puede ser substituido sin esfuerzo por servicios similares.

Las métricas se obtienen actualmente de forma manual. Con la clave ssh de mantenimiento y la configuración del servidor usada para el provisionamiento se usa una instancia local de Borgmatic para obtener información en JSON de los repositorios remotos y generar unas estadísticas básicas.

## Pruebas de restauración

Por defecto llevamos a cabo pruebas de restauración completas una vez al año. Estas pruebas de restauración se hacen por ahora de forma manual.

Para cada servidor se hacen tests funcionales sobre el último archivo de copia. Para un subconjunto de los servidores se hacen las pruebas de restauración para otros archivos (además del último) para comprobar la integridad y políticas de retención.

Las pruebas se llevan a cabo sobre máquinas vagrant que se provisionan de la misma forma que los servidores de producción (salvo particularidades).
