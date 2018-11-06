use `db_1`
CREATE TABLE `todos` (
`id` int UNSIGNED AUTO_INCREMENT,
`text` varchar(256) NOT NULL,
`done` bool DEFAULT false,
PRIMARY KEY (`id`)
);
INSERT INTO `todos` (`text`) VALUES ("Feed the cat");
INSERT INTO `todos` (`text`) VALUES ("Play with the dog");
INSERT INTO `todos` (`text`) VALUES ("Hunt the moose");