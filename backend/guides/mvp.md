## MVP Spirit

A mind set everyone should have when developing an application in agile. Project specification is vague ant it's likely to change in early stages. Our responsibility is to predict those changes and be able to process them ASAP.

1. Best case scenario first. Do not implement edge cases in early stage. It tends to take considerable amount of time and requirements may change quickly. 500 Internal Server Error is OK if clients sends invalid data. User can do anything no matter his authorization. All this can be done later on.
2. Anticipate empty state. Is it really a problem for the application to allow empty name of a user? No, it's not. Don't put these constraints on the DB level. Is it a problem for an unique username for the login? Yes. That would case not only empty data state, but authentication malfunction.
3. Anticipate model changes. Set the ground rules as loose as possible for the business model. If current spec says a car will always have an owner user, don't fall for this lie. Especially the DB constraints have to be as benevolent as possible - we can always change the data validation on the application layer as DB changes are always pain. Besides, we are ready for this if someone tackles with the database data.
4. Avoid microoptimization. At all. "Is it faster to write 3 ifs or one switch?" - nobody cares. If crucial, this part can be optimized later on.
5. Avoid premature optimization - Premature optimization is an altar where code readability is sacrificed.
6. Unnecessary generalization. If you are uncertain you are going to use the outcome, dont do it. It takes a lot of time to do it right. Otherwise it's just a mess. [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) most of the time.
7. Use TODOs. Perfectly fine if there is a missing peace we cannot do or have not all the info to do it right now. Makes it easier to find all these "todo later" stuff.
8. Leave space for extension. It may seem like a great idea to define interface that accepts e.g. just one number but world is never that simple.

Rule of thumb: Implement raw functionality first - expect it works when used as inteded. When everyone from project-team agrees this is fine, start adding/check following features (Also a list of features to skip in early MVP development):
- data validation
- access control
- strict database constraints

Authored by @vlasy