// import { Test, TestingModule } from '@nestjs/testing';
// import { TasksController } from './tasks.controller';
// import { TasksService } from './tasks.service';

// describe('TasksController', () => {
//   let controller: TasksController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [TasksController],
//       providers: [TasksService],
//     }).compile();

//     controller = module.get<TasksController>(TasksController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('TasksController', () => {
  let app: INestApplication;
  let tasksService = { findAll: () => ['test'], findOne: ()=>['test'], create:()=>['test'] };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    })
      .overrideProvider(TasksService)
      .useValue(tasksService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });



  afterAll(async () => {
    await app.close();
  });
});
