/*
Initializes the user table
*/

IF (OBJECT_ID('User', 'U') IS NULL)
BEGIN
  CREATE TABLE [dbo].[User] (
      [userId] BigInt IDENTITY(1, 1) PRIMARY KEY NOT NULL
    , [name] VarChar(255) NULL
    , [email] VarChar(255) NOT NULL
    , [password] VarChar(255) NOT NULL -- encrypted password
    , [customerId] BigInt NULL
    , [dateCreated] DateTime2 DEFAULT GETUTCDATE() NULL
    , [dateUpdated] DateTime2 DEFAULT GETUTCDATE() NULL
    , [isDisabled] Bit DEFAULT 0 NULL -- Used for determining existance
    , CONSTRAINT UC_Email UNIQUE([email]) -- Add unique constraint for emails
  )
END
