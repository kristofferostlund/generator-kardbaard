/*
Creates a <%= name %> to db and selects it.
*/

-- Insert the <%= name %>
INSERT INTO [dbo].[<%= nameCapitalized %>] (
    [description]
)
VALUES (
    @description
)

-- Select it
SELECT TOP 1
    [<%= name %>Id]
  , [description]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[<%= nameCapitalized %>]
ORDER BY [<%= name %>Id] DESC
