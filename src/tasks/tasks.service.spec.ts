import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from '../tasks/tasks.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';


type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find:jest.fn(),
  save:jest.fn(),
  remove:jest.fn()
}) 


describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: MockRepository;
  let userRepository: MockRepository; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService,
        {provide:getRepositoryToken(Task), useValue:createMockRepository()},
        {provide:getRepositoryToken(User), useValue:createMockRepository()},
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<MockRepository>(getRepositoryToken(Task))
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

describe('create', ()=>{
  describe('when task does not exist', () => {
    it('should create a new task', async () => {
      const createTaskDto = { title: 'Test Task', body:"Test Task body" };
      const userId = 1;
      const expectedTask = {};
  
      taskRepository.findOne.mockResolvedValue(null);
      taskRepository.create.mockReturnValue(expectedTask);
      userRepository.findOne.mockResolvedValue(new User());
      taskRepository.save.mockResolvedValue(expectedTask); // Mock the save method
      userRepository.save.mockResolvedValue(new User()); // Mock the save method
  
      const task = await service.create(createTaskDto, userId);
  
      expect(task).toEqual(expectedTask);
    });
  });
  
  describe('when task exist', ()=>{
    it('should throw BadRequestException', async()=>{
      const createTaskDto = { title: 'Test Task', body:'Test Task body' };
      const userId = 1;
//  when findOne is called, it should return a resolved promise with a new Task object. 
// This simulates the scenario where a task with the same title already exists in the database.
      taskRepository.findOne.mockResolvedValue(new Task());

      try {
        await service.create(createTaskDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('This task already exists');
      }
    })
  })
  describe('when an error occurs', () => {
    it('should throw Error', async () => {
      const createTaskDto = { title: 'Test Task', body:'Test Task body' };
      const userId = 1;

      taskRepository.findOne.mockImplementation(() => {
        throw new Error();
      });

      try {
        await service.create(createTaskDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Error while creating task');
      }
    });
  });
})


describe('findAll', ()=>{
  describe('when tasks exists', ()=>{
    it('should return tasks list', async()=>{
      const expectedTasks = [];
      taskRepository.find.mockResolvedValue(expectedTasks);
      const tasks = await service.findAll();
      expect(tasks).toEqual(expectedTasks);
    })
  })
  describe('otherwise', ()=>{
    it('should throw Error', async()=>{
      const expectedTasks = []
      taskRepository.find.mockReturnValue(undefined)
      try {
        await service.findAll()
      } catch (error) {
        expect(error.message).toEqual('Error finding the task')
      }
    })
  })
})
describe('findOne',()=>{
  describe('when task with id exists', ()=>{
    it('should return the tasks object', async()=>{
      const taskId = 1;
      const expectedTask = {};

      taskRepository.findOne.mockReturnValue(expectedTask)
      const task = await service.findOne(taskId);
      expect(task).toEqual(expectedTask)

    });
  });
  describe('otherwise',()=>{
    it('should throw the NotFoundException', async()=>{
      const taskId = 1;
      taskRepository.findOne.mockReturnValue(undefined)

      try {
        await service.findOne(taskId)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Task not found')
      }
    });
  })
});

describe('update', ()=>{
  describe('when task does not exists', ()=>{
    it('should throw not found execption', async()=>{
      const taskId = 1;
      taskRepository.findOne.mockReturnValue(undefined)
      try {
        await service.findOne(taskId)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Task not found')
      }
    })
  })
  describe('when task exists', () => {
    it('should update the task', async () => {
      const id = 1;
      const updateTaskDto = { title: 'Updated Task', body: 'Updated Task body' };
      const expectedTask = {};

      taskRepository.findOne.mockResolvedValue(new Task());
      taskRepository.save.mockResolvedValue(expectedTask); // Mock the save method

      const task = await service.update(id, updateTaskDto);

      expect(task).toEqual(expectedTask);
    });
  });
  describe('when an error occurs', () => {
    it('should throw Error', async () => {
      const id = 1;
      const updateTaskDto = { title: 'Updated Task', body: 'Updated Task body' };

      taskRepository.findOne.mockImplementation(() => {
        throw new Error();
      });

      try {
        await service.update(id, updateTaskDto);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Error while updating the task');
      }
    });
  });
})

describe('delete', ()=>{
  describe('when task does not exists', ()=>{
    it('should throw NotFoundException', async()=>{
      const taskId = 1
      taskRepository.findOne.mockReturnValue(undefined)

      try {
        await service.findOne(taskId)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toEqual('Task not found')
      }
    })
  })
  describe('when task exists', ()=>{
    it('should delete task', async()=>{
      const taskId = 1
      taskRepository.findOne.mockReturnValue(1)
      taskRepository.remove.mockResolvedValue({})
      await service.remove(taskId)
    })
  })
  describe('when an error occurs', ()=>{
    it('should throw error', async()=>{
      const taskId = 1
      taskRepository.findOne.mockReturnValue(1)
      taskRepository.remove.mockImplementation(()=>{
        throw new Error()
      })
      try {
        await service.remove(taskId)
      } catch (error) {
          expect(error.message).toEqual('Error while removing the task')
      }
    })
  })
})


});
