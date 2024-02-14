import { INestApplication } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing";
import { TasksModule } from "../../src/tasks/tasks.module";

describe('[Feature] Tasks- /tasks', ()=>{
    let app: INestApplication;


    beforeAll(async()=>{
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports:[TasksModule]
        }).compile()

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it.todo('Create [POST /]')
    it.todo('Get all [GET /]')
    it.todo('Get one [GET /:id]')
    it.todo('Update one [PATCH /:id]')
    it.todo('DELETE one [DELETE /:id]')



    afterAll(async () => {
        await app.close();
    });
});