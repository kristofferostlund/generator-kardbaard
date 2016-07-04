/*
Creates a <%= name %> to db and selects it.
*/

DECLARE @id BigInt

-- Insert the <%= name %>
INSERT INTO [dbo].[<%= nameCapitalized %>] (
    [description]
)
VALUES (
    @description
)

SELECT @id = SCOPE_IDENTITY()

-- Select it
SELECT
    [<%= name %>Id]
  , [description]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[<%= nameCapitalized %>]
  WHERE [<%= name %>Id] = @id
