/*
Initializes the <%= name %> table
*/

IF (OBJECT_ID('<%= nameCapitalized %>', 'U') IS NULL)
BEGIN
  CREATE TABLE [dbo].[<%= nameCapitalized %>] (
      [<%= name %>Id] BigInt IDENTITY(1, 1) PRIMARY KEY NOT NULL
    , [description] VarChar(255) NULL
    , [dateCreated] DateTime2 DEFAULT GETUTCDATE() NULL
    , [dateUpdated] DateTime2 DEFAULT GETUTCDATE() NULL
    , [isDisabled] Bit DEFAULT 0 NULL -- Used for determining existance
  )
END
