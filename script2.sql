CREATE TABLE [dbo].[AspNetUser] (
    [Id_AspNetUser] NVARCHAR(450) NOT NULL,
    [First_Name] NVARCHAR(50) NULL,
    [LastName] NVARCHAR(50) NULL,
    [UserName] NVARCHAR(50) NULL,
    [NormalizedUserName] NVARCHAR(50) NULL,
    [Email] NVARCHAR(50) NULL,
    [NormalizedEmail] NVARCHAR(50) NULL,
    [EmailConfirmed] BIT NULL,
    [PasswordHash] NVARCHAR(50) NULL,
    [SecurityStamp] NVARCHAR(50) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    [PhoneNumber] NVARCHAR(50) NULL,
    [PhoneNumberConfirmed] BIT NULL,
    [TwoFactorEnabled] BIT NULL,
    [LockoutEnd] DATETIME NULL,
    [LockoutEnabled] BIT NULL,
    [AccessFailedCount] INT NULL,
    [AvatarPath] NVARCHAR(255) NULL,
    [IsActive] BIT NULL,
    PRIMARY KEY ([Id_AspNetUser])
);

CREATE TABLE [dbo].[AspNetRoles] (
    [Id_AspNetRole] NVARCHAR(450) NOT NULL,
    [Name] NVARCHAR(50) NULL,
    [NormalizedName] NVARCHAR(50) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    PRIMARY KEY ([Id_AspNetRole])
);

CREATE TABLE [dbo].[Categories] (
    [Id_Category] NVARCHAR(450) NOT NULL,
    [Name] NVARCHAR(50) NULL,
    PRIMARY KEY ([Id_Category])
);

CREATE TABLE [dbo].[AspNetUserToken] (
    [Id_AspNetUserToken] NVARCHAR(450) NOT NULL,
    [Value_] NVARCHAR(50) NULL,
    [Id_AspNetUser] NVARCHAR(450) NOT NULL,
    PRIMARY KEY ([Id_AspNetUserToken]),
    FOREIGN KEY ([Id_AspNetUser]) REFERENCES [dbo].[AspNetUser]([Id_AspNetUser])
);

CREATE TABLE [dbo].[AspNetRoleClaim] (
    [Id_AspNetRoleClaim] NVARCHAR(450) NOT NULL,
    [ClaimType] NVARCHAR(50) NULL,
    [ClaimValue] NVARCHAR(50) NULL,
    [Id_AspNetRole] NVARCHAR(450) NOT NULL,
    PRIMARY KEY ([Id_AspNetRoleClaim]),
    FOREIGN KEY ([Id_AspNetRole]) REFERENCES [dbo].[AspNetRoles]([Id_AspNetRole])
);

CREATE TABLE [dbo].[AspNetUserLogin] (
    [Id_AspNetUserLogin] NVARCHAR(450) NOT NULL,
    [ProviderDisplayName] NVARCHAR(50) NULL,
    [Id_AspNetUser] NVARCHAR(450) NOT NULL,
    PRIMARY KEY ([Id_AspNetUserLogin]),
    FOREIGN KEY ([Id_AspNetUser]) REFERENCES [dbo].[AspNetUser]([Id_AspNetUser])
);

CREATE TABLE [dbo].[AspNetUserClaim] (
    [Id_AspNetUserClaim] NVARCHAR(450) NOT NULL,
    [ClaimType] NVARCHAR(50) NULL,
    [ClaimValue] NVARCHAR(50) NULL,
    [Id_AspNetUser] NVARCHAR(450) NOT NULL,
    PRIMARY KEY ([Id_AspNetUserClaim]),
    FOREIGN KEY ([Id_AspNetUser]) REFERENCES [dbo].[AspNetUser]([Id_AspNetUser])
);

CREATE TABLE [dbo].[Courses] (
    [Id_Course] NVARCHAR(450) NOT NULL,
    [Title] NVARCHAR(200) NULL,
    [Description] NVARCHAR(MAX) NULL,
    [ImageUrl] NVARCHAR(255) NULL
