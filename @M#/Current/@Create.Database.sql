CREATE DATABASE [#DATABASE.NAME#]
ON PRIMARY (NAME = N'#DATABASE.NAME#', FILENAME = N'#STORAGE.PATH#\#DATABASE.NAME#.mdf')
LOG ON (NAME = N'#DATABASE.NAME#_log', FILENAME = N'#STORAGE.PATH#\#DATABASE.NAME#_log.ldf');

ALTER DATABASE [#DATABASE.NAME#] SET RECOVERY SIMPLE;
ALTER DATABASE [#DATABASE.NAME#] SET READ_COMMITTED_SNAPSHOT ON;
GO
USE [#DATABASE.NAME#];
EXEC sp_changedbowner 'sa'
GO

-- Administrators Table ========================
CREATE TABLE Administrators (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [ImpersonationToken] nvarchar(40)  NULL,
    [Order] int  NOT NULL
)


GO
-- ApplicationEvents Table ========================
CREATE TABLE ApplicationEvents (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [UserId] nvarchar(200)  NULL,
    [Date] datetime  NOT NULL,
    [Event] nvarchar(200)  NOT NULL,
    [ItemType] nvarchar(200)  NULL,
    [ItemKey] nvarchar(500)  NULL,
    [Data] nvarchar(MAX)  NULL,
    [IP] nvarchar(200)  NULL
)


GO
-- ContentBlocks Table ========================
CREATE TABLE ContentBlocks (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [Name] nvarchar(200)  NOT NULL,
    [Key] nvarchar(200)  NOT NULL,
    [Content] nvarchar(MAX)  NOT NULL
)


GO
-- EmailQueueItems Table ========================
CREATE TABLE EmailQueueItems (
    [.Deleted] bit NOT NULL,
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [Body] nvarchar(MAX)  NULL,
    [Date] datetime  NOT NULL,
    [EnableSsl] bit  NOT NULL,
    [Html] bit  NOT NULL,
    [SenderAddress] nvarchar(200)  NULL,
    [SenderName] nvarchar(200)  NULL,
    [Subject] nvarchar(200)  NOT NULL,
    [To] nvarchar(200)  NULL,
    [Attachments] nvarchar(200)  NULL,
    [Bcc] nvarchar(200)  NULL,
    [Cc] nvarchar(200)  NULL,
    [Retries] int  NOT NULL,
    [VCalendarView] nvarchar(200)  NULL,
    [Username] nvarchar(200)  NULL,
    [Password] nvarchar(200)  NULL,
    [SmtpHost] nvarchar(200)  NULL,
    [SmtpPort] int  NULL,
    [Category] nvarchar(200)  NULL
)


GO
-- EmailTemplates Table ========================
CREATE TABLE EmailTemplates (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [Key] nvarchar(200)  NOT NULL,
    [Subject] nvarchar(200)  NOT NULL,
    [Body] nvarchar(MAX)  NOT NULL,
    [MandatoryPlaceholders] nvarchar(200)  NULL
)


GO
-- PasswordResetTickets Table ========================
CREATE TABLE PasswordResetTickets (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [DateCreated] datetime  NOT NULL,
    [IsUsed] bit  NOT NULL,
    [User] uniqueidentifier  NOT NULL
)


GO
-- Settings Table ========================
CREATE TABLE Settings (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [Name] nvarchar(200)  NOT NULL,
    [PasswordResetTicketExpiryMinutes] int  NOT NULL
)


GO
-- Users Table ========================
CREATE TABLE Users (
    [Id] uniqueidentifier PRIMARY KEY NONCLUSTERED,
    [FirstName] nvarchar(200)  NOT NULL,
    [LastName] nvarchar(200)  NOT NULL,
    [Email] nvarchar(100)  NOT NULL,
    [Password] nvarchar(100)  NULL,
    [IsDeactivated] bit  NOT NULL,
    [Salt] nvarchar(200)  NOT NULL
)


GO
-- ######################## Bridge Tables ######################################
