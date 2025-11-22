# MySQL Şifre Sıfırlama

## Yöntem 1: MySQL Güvenli Mod (Önerilen)

### Adım 1: MySQL'i durdur
```bash
sudo systemctl stop mysql
# veya
sudo systemctl stop mariadb
```

### Adım 2: MySQL'i güvenli modda başlat
```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

### Adım 3: MySQL'e şifresiz bağlan
```bash
mysql -u root
```

### Adım 4: Şifreyi sıfırla
```sql
USE mysql;
UPDATE user SET authentication_string=PASSWORD('YENI_SIFRE') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

**MySQL 8.0+ için:**
```sql
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YENI_SIFRE';
FLUSH PRIVILEGES;
EXIT;
```

### Adım 5: MySQL'i normal modda yeniden başlat
```bash
sudo pkill mysqld
sudo systemctl start mysql
# veya
sudo systemctl start mariadb
```

### Adım 6: Yeni şifre ile test et
```bash
mysql -u root -p
# YENI_SIFRE'yi girin
```

---

## Yöntem 2: systemd ile (Daha Kolay)

### Adım 1: MySQL'i durdur
```bash
sudo systemctl stop mysql
```

### Adım 2: Init dosyası oluştur
```bash
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'YENI_SIFRE';" | sudo tee /var/run/mysqld/init-file
```

### Adım 3: MySQL'i init dosyası ile başlat
```bash
sudo mysqld --init-file=/var/run/mysqld/init-file &
```

### Adım 4: MySQL'in başlamasını bekle (5-10 saniye)
```bash
sleep 10
```

### Adım 5: Init dosyasını sil ve MySQL'i normal başlat
```bash
sudo rm /var/run/mysqld/init-file
sudo pkill mysqld
sudo systemctl start mysql
```

---

## Yöntem 3: Hızlı Komut (Tek Satır)

```bash
sudo systemctl stop mysql && \
sudo mysqld_safe --skip-grant-tables --skip-networking & \
sleep 5 && \
mysql -u root << EOF
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YENI_SIFRE';
FLUSH PRIVILEGES;
EOF
sudo pkill mysqld && \
sudo systemctl start mysql
```

---

## Yöntem 4: MariaDB için

```bash
sudo systemctl stop mariadb
sudo mysqld_safe --skip-grant-tables &
mysql -u root
```

Sonra:
```sql
USE mysql;
UPDATE user SET password=PASSWORD('YENI_SIFRE') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

```bash
sudo pkill mysqld
sudo systemctl start mariadb
```

---

## Önemli Notlar

1. **YENI_SIFRE** yerine güçlü bir şifre kullanın
2. Şifre sıfırlama işlemi sırasında MySQL servisi durur
3. İşlem tamamlandıktan sonra MySQL'i normal modda başlatmayı unutmayın
4. Güvenlik için şifreyi güçlü tutun

---

## Şifreyi Unuttuysanız ve Sadece Veritabanına Erişmek İstiyorsanız

Eğer sadece veritabanına erişmek istiyorsanız, şifre olmadan:

```bash
sudo mysql -u root
```

Veya:
```bash
sudo mysql
```

Sonra şifreyi değiştirebilirsiniz:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YENI_SIFRE';
FLUSH PRIVILEGES;
```

