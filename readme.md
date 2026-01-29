
# create the database


initial plan to use sqlite3

```
sqlite3 messy.db
create table cabinets (id integer auto_increment primary key, name text not null, description text, photo blob);
create table items (id integer auto_increment primary key, name text not null, description text, photo blob, cabinet_id integer, foreign key (cabinet_id) references cabinets(id));
insert into cabinets (name, description, photo) values ('dulap1', 'dummy dulap', NULL);
insert into items (name, description, photo, cabinet_id) values ('item1', 'dummy item', NULL, 1);

select * from cabinets;
select * from items;
```

now using mysql so you'll have to create the database in the mysql cli
```
create database messy;
use messy;
```

# run the php server

```
php -S localhost:8005 -c php.ini
