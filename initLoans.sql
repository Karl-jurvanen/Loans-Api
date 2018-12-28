-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema db_1
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema db_1
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_1` DEFAULT CHARACTER SET utf8 ;
USE `db_1` ;

-- -----------------------------------------------------
-- Table `db_1`.`laite`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_1`.`laite` ;

CREATE TABLE IF NOT EXISTS `db_1`.`laite` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `koodi` VARCHAR(45) NULL,
  `nimi` VARCHAR(45) NULL,
  `tiedot` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_1`.`henkilo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_1`.`henkilo` ;

CREATE TABLE IF NOT EXISTS `db_1`.`henkilo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `etunimi` VARCHAR(45) NULL,
  `sukunimi` VARCHAR(45) NULL,
  `rooli` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `salasana` VARCHAR(64) NULL,
  `adminStatus` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_1`.`lainaus`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_1`.`lainaus` ;

CREATE TABLE IF NOT EXISTS `db_1`.`lainaus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `laite_id` INT NOT NULL,
  `lainaaja_id` INT NOT NULL,
  `vastuuhenkilo_lainaus_id` INT NOT NULL,
  `vastuuhenkilo_palautus_id` INT NULL,
  `kunto_lainaus` VARCHAR(45) NULL,
  `kunto_palautus` VARCHAR(45) NULL,
  `lainausaika` DATETIME NULL,
  `palautusaika` DATETIME NULL,
  `palautettu_aika` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Lainaus_Laite_idx` (`laite_id` ASC),
  INDEX `fk_Lainaus_Henkilo1_idx` (`lainaaja_id` ASC),
  INDEX `fk_Lainaus_Henkilo2_idx` (`vastuuhenkilo_lainaus_id` ASC),
  INDEX `fk_Lainaus_Henkilo3_idx` (`vastuuhenkilo_palautus_id` ASC),
  CONSTRAINT `fk_Lainaus_Laite`
    FOREIGN KEY (`laite_id`)
    REFERENCES `db_1`.`laite` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Lainaus_Henkilo1`
    FOREIGN KEY (`lainaaja_id`)
    REFERENCES `db_1`.`henkilo` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Lainaus_Henkilo2`
    FOREIGN KEY (`vastuuhenkilo_lainaus_id`)
    REFERENCES `db_1`.`henkilo` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Lainaus_Henkilo3`
    FOREIGN KEY (`vastuuhenkilo_palautus_id`)
    REFERENCES `db_1`.`henkilo` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_1`.`vastuuhenkilo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_1`.`vastuuhenkilo` ;

CREATE TABLE IF NOT EXISTS `db_1`.`vastuuhenkilo` (
  `laite_id` INT NOT NULL,
  `henkilo_id` INT NOT NULL,
  PRIMARY KEY (`laite_id`, `henkilo_id`),
  INDEX `fk_laite_has_henkilo_henkilo1_idx` (`henkilo_id` ASC),
  INDEX `fk_laite_has_henkilo_laite1_idx` (`laite_id` ASC),
  CONSTRAINT `fk_laite_has_henkilo_laite1`
    FOREIGN KEY (`laite_id`)
    REFERENCES `db_1`.`laite` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_laite_has_henkilo_henkilo1`
    FOREIGN KEY (`henkilo_id`)
    REFERENCES `db_1`.`henkilo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

USE `db_1` ;

-- -----------------------------------------------------
-- procedure GetDevices
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`GetDevices`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE GetDevices()
   BEGIN
   DROP TEMPORARY TABLE IF EXISTS temp;
   CREATE TEMPORARY TABLE temp AS (
SELECT 
    laite.id,
    laite.koodi as 'code',
    laite.nimi as 'name',
    laite.tiedot as 'info',
    henkilo.id AS 'personInChargeId',
    henkilo.etunimi AS 'personInChargeFirstName',
    henkilo.sukunimi AS 'personInChargeLastName'
FROM
    laite
        LEFT OUTER JOIN
    vastuuhenkilo ON (laite.id = vastuuhenkilo.laite_id)
        LEFT OUTER JOIN
    henkilo ON (vastuuhenkilo.henkilo_id = henkilo.id)
);

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure GetDevice
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`GetDevice`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE GetDevice(
	IN deviceID int
)
   BEGIN
   SELECT 
	laite.id,
    laite.koodi as 'code',
    laite.nimi as 'name',
    laite.tiedot as 'info',
    henkilo.id AS 'personInChargeId',
    henkilo.etunimi AS 'personInChargeFirstName',
    henkilo.sukunimi AS 'personInChargeLastName'
FROM
    laite
        LEFT OUTER JOIN
    vastuuhenkilo ON (laite.id = vastuuhenkilo.laite_id)
        LEFT OUTER JOIN
    henkilo ON (vastuuhenkilo.henkilo_id = henkilo.id)
WHERE
	laite.id = deviceID;
   END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure GetLate
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`GetLate`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE GetLate()

BEGIN
SELECT 
    laite.id,
    laite.koodi as 'code',
    laite.nimi as 'name',
    laite.tiedot as 'info',
    lainaaja.id AS 'loanerId',
    lainaaja.etunimi AS 'loanerFirstName',
    lainaaja.sukunimi AS 'loanerLastName',
    lainaus.lainausaika as 'begins',
    lainaus.palautusaika AS 'ends',
    lainaus.kunto_lainaus AS 'condition',
    vastuuh.id AS 'personInChargeId',
    vastuuh.etunimi AS 'personInChargeFirstName',
    vastuuh.sukunimi AS 'personInChargeLastName'
FROM
    lainaus
        INNER JOIN
    laite ON (lainaus.laite_id = laite.id AND lainaus.palautettu_aika IS NULL AND lainaus.palautusaika < now())
        INNER JOIN
    henkilo lainaaja ON (lainaus.lainaaja_id = lainaaja.id)
        LEFT OUTER JOIN
    vastuuhenkilo ON (laite.id = vastuuhenkilo.laite_id)
        LEFT OUTER JOIN
    henkilo vastuuh ON (vastuuhenkilo.henkilo_id = vastuuh.id);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure GetLoans
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`GetLoans`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE GetLoans()
BEGIN
SELECT 
	lainaus.id as 'id',
    laite.id as 'deviceId',
    laite.koodi as 'code',
    laite.nimi as 'name',
    laite.tiedot as 'info',
    lainaaja.id AS 'loanerId',
    lainaaja.etunimi AS 'loanerFirstName',
    lainaaja.sukunimi AS 'loanerLastName',
    lainaus.lainausaika as 'begins',
    lainaus.palautusaika AS 'ends',
    vastuuhLainaus.id AS 'personInChargeLoanedId',
    lainaus.kunto_lainaus AS 'conditionLoaned',
    lainaus.palautettu_aika AS 'timeReturned',
    lainaus.kunto_palautus AS 'conditionReturned',
    vastuuhPalautus.id AS 'personInChargeReturnedId'
	
FROM
    lainaus
        INNER JOIN
    laite ON (lainaus.laite_id = laite.id)
        INNER JOIN
    henkilo lainaaja ON (lainaus.lainaaja_id = lainaaja.id)
        LEFT OUTER JOIN
    henkilo vastuuhLainaus ON (lainaus.vastuuhenkilo_lainaus_id = vastuuhLainaus.id)
		LEFT OUTER JOIN
    henkilo vastuuhPalautus ON (lainaus.vastuuhenkilo_palautus_id = vastuuhPalautus.id);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure NewLoan
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`NewLoan`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE NewLoan(
	IN 	deviceID int,
		personInChargeLoan int,
		loanerID int, 
        loanCondition varchar(20),
        loanTime datetime,
        endTime datetime
	)
   BEGIN
   	DECLARE EXIT HANDLER FOR sqlexception
		BEGIN
			ROLLBACK;
            RESIGNAL;
		END;   
   	DECLARE EXIT HANDLER FOR sqlstate '45000' 
		BEGIN
			ROLLBACK;
            RESIGNAL;
		END;
   start transaction;
   
   if exists(select 1 
	from lainaus	
    where laite_id = deviceID AND palautettu_aika IS null)
    then 
		SIGNAL sqlstate '45000'
			SET MESSAGE_TEXT = 'Already loaned', MYSQL_ERRNO = 1645;
            rollback;
	END IF;
   
   #check if person in charge of device given matches with database
	 IF EXISTS (SELECT * 
		FROM
			vastuuhenkilo WHERE laite_id = deviceID AND henkilo_id = personInChargeLoan
			)
        
         THEN
			insert into lainaus (laite_id, lainaaja_id, vastuuhenkilo_lainaus_id, kunto_lainaus, lainausaika, palautusaika)
			values ( deviceID, loanerID, personInChargeLoan, loanCondition, loanTime, endTime);
			
            
			SELECT LAST_INSERT_ID() AS id;
            commit;
        ELSE
            SIGNAL sqlstate '45000'
			SET MESSAGE_TEXT = 'ERROR', MYSQL_ERRNO = 1644;
            rollback;
		END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure GetLoan
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`GetLoan`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE GetLoan(
	IN loanId int
)
BEGIN
SELECT 
	lainaus.id as 'id',
    laite.id as 'deviceId',
    laite.koodi as 'code',
    laite.nimi as 'name',
    laite.tiedot as 'info',
    lainaaja.id AS 'loanerId',
    lainaaja.etunimi AS 'loanerFirstName',
    lainaaja.sukunimi AS 'loanerLastName',
    lainaus.lainausaika as 'begins',
    lainaus.palautusaika AS 'ends',
    lainaus.kunto_lainaus AS 'conditionLoaned',
    vastuuhLainaus.id AS 'personInChargeLoanedId',
    lainaus.palautettu_aika AS 'timeReturned',
    lainaus.kunto_palautus AS 'conditionReturned',
    vastuuhPalautus.id AS 'personInChargeReturnedId'
	
FROM
    lainaus
        INNER JOIN
    laite ON (lainaus.laite_id = laite.id AND lainaus.id = loanId)
        INNER JOIN
    henkilo lainaaja ON (lainaus.lainaaja_id = lainaaja.id)
        LEFT OUTER JOIN
    henkilo vastuuhLainaus ON (lainaus.vastuuhenkilo_lainaus_id = vastuuhLainaus.id)
		LEFT OUTER JOIN
    henkilo vastuuhPalautus ON (lainaus.vastuuhenkilo_palautus_id = vastuuhPalautus.id);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure NewDevice
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`NewDevice`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE NewDevice(
	IN 	deviceCode varchar(20),
        deviceName varchar(20),
        deviceInfo varchar(45),
        personInChargeId int
	)
   BEGIN
   
	DECLARE id INT;
	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			ROLLBACK;
            RESIGNAL;
		END;
	START TRANSACTION;
	
   
    
	INSERT INTO laite(koodi, nimi, tiedot)
    VALUES(deviceCode, deviceName, deviceInfo);
	SET id = last_insert_id();
    
    INSERT INTO vastuuhenkilo(laite_id, henkilo_id)
    VALUES(id, personInChargeId);
    
    SELECT id as 'insertId';
    
    COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure ReturnLoan
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`ReturnLoan`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE ReturnLoan(
	IN 	loanId int,
		personInChargeReturn int,
        returnCondition varchar(20),
        returnTime datetime
	)
   BEGIN
   	DECLARE EXIT HANDLER FOR sqlexception
		BEGIN
			ROLLBACK;
            RESIGNAL;
		END;   
   	DECLARE EXIT HANDLER FOR sqlstate '45000' 
		BEGIN
			ROLLBACK;
            RESIGNAL;
		END;
   start transaction;
      
   #check if person in charge of device given matches with database
	 IF EXISTS(SELECT *
		FROM
			lainaus 
				INNER JOIN 
            laite ON ( laite.id = lainaus.laite_id AND lainaus.id = loanId)
				INNER JOIN 
			vastuuhenkilo ON (vastuuhenkilo.laite_id = lainaus.laite_id 
							AND vastuuhenkilo.henkilo_id = personInChargeReturn)
			)
        
         THEN
			UPDATE lainaus 
            SET kunto_palautus = returnCondition, 
				vastuuhenkilo_palautus_id = personInChargeReturn,
                palautettu_aika = returnTime
			WHERE id = loanId;
		SELECT loanId AS 'insertId';
            commit;
        ELSE
            SIGNAL sqlstate '45000'
			SET MESSAGE_TEXT = 'ERROR', MYSQL_ERRNO = 1644;
            rollback;
		END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure GetMyLoans
-- -----------------------------------------------------

USE `db_1`;
DROP procedure IF EXISTS `db_1`.`GetMyLoans`;

DELIMITER $$
USE `db_1`$$
CREATE PROCEDURE GetMyLoans(
	IN userId int
	)
BEGIN
SELECT 
	lainaus.id as 'id',
    laite.id as 'deviceId',
    laite.koodi as 'code',
    laite.nimi as 'name',
    laite.tiedot as 'info',
    lainaaja.id AS 'loanerId',
    lainaaja.etunimi AS 'loanerFirstName',
    lainaaja.sukunimi AS 'loanerLastName',
    lainaus.lainausaika as 'begins',
    lainaus.palautusaika AS 'ends',
    vastuuhLainaus.id AS 'personInChargeLoanedId',
    lainaus.kunto_lainaus AS 'conditionLoaned',
    lainaus.palautettu_aika AS 'timeReturned',
    lainaus.kunto_palautus AS 'conditionReturned',
    vastuuhPalautus.id AS 'personInChargeReturnedId'
	
FROM
    lainaus
        INNER JOIN
    laite ON (lainaus.laite_id = laite.id)
        INNER JOIN
    henkilo lainaaja ON (lainaus.lainaaja_id = lainaaja.id AND lainaaja.id = userId)
        LEFT OUTER JOIN
    henkilo vastuuhLainaus ON (lainaus.vastuuhenkilo_lainaus_id = vastuuhLainaus.id)
		LEFT OUTER JOIN
    henkilo vastuuhPalautus ON (lainaus.vastuuhenkilo_palautus_id = vastuuhPalautus.id);
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `db_1`.`laite`
-- -----------------------------------------------------
START TRANSACTION;
USE `db_1`;
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '123-555', 'Arduino', 'Atmega 328');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '123-666', 'Arduino', 'Atmega 328');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '222-000', 'Thinkpad', 'T420');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '555-123', 'Thinkpad', 'T420');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '555-152', 'Ipad', 'Air');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '555-153', 'Ipad', 'Air');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '610-001', 'Macbook Pro', '2018');
INSERT INTO `db_1`.`laite` (`id`, `koodi`, `nimi`, `tiedot`) VALUES (DEFAULT, '610-002', 'Macbook Pro', '2018');

COMMIT;


-- -----------------------------------------------------
-- Data for table `db_1`.`henkilo`
-- -----------------------------------------------------
START TRANSACTION;
USE `db_1`;
INSERT INTO `db_1`.`henkilo` (`id`, `etunimi`, `sukunimi`, `rooli`, `email`, `salasana`, `adminStatus`) VALUES (DEFAULT, 'teemu', 'teekkari', 'opiskelija', 'test', 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=', false);
INSERT INTO `db_1`.`henkilo` (`id`, `etunimi`, `sukunimi`, `rooli`, `email`, `salasana`, `adminStatus`) VALUES (DEFAULT, 'aki', 'opettaja', 'opettaja', 'admin', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', true);
INSERT INTO `db_1`.`henkilo` (`id`, `etunimi`, `sukunimi`, `rooli`, `email`, `salasana`, `adminStatus`) VALUES (DEFAULT, 'Pertti', 'Peruskäyttäjä', 'opiskelija', 'user@example.com', '4eGk+TyBTZOCVOb9faEvCWyZSOrnvEE3ZWICpBOg8/Q=', false);
INSERT INTO `db_1`.`henkilo` (`id`, `etunimi`, `sukunimi`, `rooli`, `email`, `salasana`, `adminStatus`) VALUES (DEFAULT, 'Yrjö', 'Ylläpitäjä', 'opettaja', 'admin@example.com', 'dJ8Jut6KynVWYO6xd5LaiAIY1PvcTiX77Cedf+n2XXA=', true);
INSERT INTO `db_1`.`henkilo` (`id`, `etunimi`, `sukunimi`, `rooli`, `email`, `salasana`, `adminStatus`) VALUES (DEFAULT, 'kalle', 'järvinen', 'opiskelija', NULL, NULL, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `db_1`.`lainaus`
-- -----------------------------------------------------
START TRANSACTION;
USE `db_1`;
INSERT INTO `db_1`.`lainaus` (`id`, `laite_id`, `lainaaja_id`, `vastuuhenkilo_lainaus_id`, `vastuuhenkilo_palautus_id`, `kunto_lainaus`, `kunto_palautus`, `lainausaika`, `palautusaika`, `palautettu_aika`) VALUES (DEFAULT, 1, 4, 2, NULL, 'uusi', NULL, '2018-10-16 20:00:00', '2018-10-25 00:00:00', NULL);
INSERT INTO `db_1`.`lainaus` (`id`, `laite_id`, `lainaaja_id`, `vastuuhenkilo_lainaus_id`, `vastuuhenkilo_palautus_id`, `kunto_lainaus`, `kunto_palautus`, `lainausaika`, `palautusaika`, `palautettu_aika`) VALUES (DEFAULT, 2, 1, 2, NULL, 'uusi', NULL, '2018-10-5 20:00:00', '2018-10-12 00:00:00', NULL);
INSERT INTO `db_1`.`lainaus` (`id`, `laite_id`, `lainaaja_id`, `vastuuhenkilo_lainaus_id`, `vastuuhenkilo_palautus_id`, `kunto_lainaus`, `kunto_palautus`, `lainausaika`, `palautusaika`, `palautettu_aika`) VALUES (DEFAULT, 3, 1, 3, 3, 'hyvä', 'hyvä', '2018-10-10 08:07:00', '2018-10-16 00:00:00', '2018-10-14 11:00:00');
INSERT INTO `db_1`.`lainaus` (`id`, `laite_id`, `lainaaja_id`, `vastuuhenkilo_lainaus_id`, `vastuuhenkilo_palautus_id`, `kunto_lainaus`, `kunto_palautus`, `lainausaika`, `palautusaika`, `palautettu_aika`) VALUES (DEFAULT, 3, 1, 3, NULL, 'hyvä', NULL, '2018-10-18 07:30:00', '2018-10-24 00:00:00', NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `db_1`.`vastuuhenkilo`
-- -----------------------------------------------------
START TRANSACTION;
USE `db_1`;
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (1, 1);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (2, 1);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (3, 2);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (4, 2);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (5, 1);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (6, 2);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (1, 2);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (2, 2);
INSERT INTO `db_1`.`vastuuhenkilo` (`laite_id`, `henkilo_id`) VALUES (4, 1);

COMMIT;

