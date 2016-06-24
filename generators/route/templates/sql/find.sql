/*
Finds all <%= name %>s non-disabled <%= name %>s
*/

SELECT
    [<%= name %>Id]
  , [description]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[<%= nameCapitalized %>]
WHERE [isDisabled] = 0
