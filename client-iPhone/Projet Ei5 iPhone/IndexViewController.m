//
//  ViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "IndexViewController.h"
#import "Arduino.h"

@interface IndexViewController ()

@end

@implementation IndexViewController

@synthesize tableView, editRestServerButton, arduinos;

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    arduinos = [[NSMutableArray alloc] init];
    tableView.dataSource = self;
    tableView.delegate = self;
    
    editRestServerButton.target = self;
    editRestServerButton.action = @selector(editRestServer:);
    
    [self fetchArduinosList];
    
}

-(void)fetchArduinosList {
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
    NSOperationQueue *queue = [[NSOperationQueue alloc] init];
    [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
     {
         if([data length] > 0 && error == nil) {
             NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
             
             [self performSelectorOnMainThread:@selector(updateUIWithDictionary:) withObject:json waitUntilDone:YES];
             
         }
         else NSLog(@"error request arduino list");
     }];
}

-(void)updateUIWithDictionary:(NSDictionary *)json {
    NSArray *arrayArduinosJson = [json valueForKey:@"data"];
    for(NSDictionary *json in arrayArduinosJson) {
        Arduino *arduino = [[Arduino alloc] initWithJson:json];
        if (arduino != nil) [arduinos addObject:arduino];
        arduino = nil;
    }
    [tableView reloadData];
}

//define number of sections
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 2;
}

//define number of rows for each section
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if(section == 0) return arduinos.count;
    else if(section == 1) return 4;
    else return 0;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if(section == 0) return @"Arduinos";
    else if(section == 1) return @"Actions";
    else return nil;
}

//change color of header titles
- (void)tableView:(UITableView *)tableView willDisplayHeaderView:(UIView *)view forSection:(NSInteger)section
{
    // Text Color
    UITableViewHeaderFooterView *header = (UITableViewHeaderFooterView *)view;
    [header.textLabel setTextColor:[UIColor whiteColor]];
}

- (UITableViewCell *) tableView:(UITableView *)table cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *cellIdentifier = @"cell";
    
    UITableViewCell *cell = [table dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil) cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    
    cell.backgroundColor = [UIColor darkGrayColor];
    cell.textLabel.textColor = [UIColor lightGrayColor];
    
    //change color when cell selected
    UIView *selectionColor = [[UIView alloc] init];
    selectionColor.backgroundColor = UIColorFromRGB(0x067AB5);
    cell.selectedBackgroundView = selectionColor;
    
    //arduinos
    if(indexPath.section == 0) {
        cell.textLabel.text = ((Arduino*)[arduinos objectAtIndex:indexPath.row]).desc;
    }
    //actions
    if(indexPath.section == 1) {
        switch (indexPath.row) {
            case 0: cell.textLabel.text = @"Read Pin"; break; //read
            case 1: cell.textLabel.text = @"Write Pin"; break; //write
            case 2: cell.textLabel.text = @"Blink"; break; //blink
            case 3: cell.textLabel.text = @"Send command"; break; //command
            default: break;
        }
    }

    return cell;
}

//Action when a cell is selected
- (void) tableView:(UITableView *)table didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    NSLog(@"%@", [NSString stringWithFormat:@"Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
    if ([table isEqual:tableView] && indexPath.section == 1) {
        switch (indexPath.row) {
            case 0:[self performSegueWithIdentifier:@"indexToRead" sender:NULL]; break; //read
            case 1:[self performSegueWithIdentifier:@"indexToWrite" sender:NULL]; break; //write
            case 2:[self performSegueWithIdentifier:@"indexToBlink" sender:NULL]; break; //blink
            case 3:[self performSegueWithIdentifier:@"indexToCommand" sender:NULL]; break; //command
            default: break;
        }
        
    }
}

-(void)editRestServer:(id)sender {
    UIAlertView *message = [[UIAlertView alloc] initWithTitle:@"REST Server"
                                                      message:nil
                                                     delegate:nil
                                            cancelButtonTitle:@"Cancel"
                                            otherButtonTitles:@"OK",nil];
    message.alertViewStyle = UIAlertViewStylePlainTextInput;
    message.delegate = self;
    [[message textFieldAtIndex:0] setText:globalServerAddress];
    [[message textFieldAtIndex:0] setKeyboardAppearance:UIKeyboardAppearanceDark];
    [message show];
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    NSString *title = [alertView buttonTitleAtIndex:buttonIndex];
    if([title isEqualToString:@"OK"])
    {
        UITextField *url = [alertView textFieldAtIndex:0];
        //check if url is ok
        /*
         NSMutableURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
        NSOperationQueue *queue = [[NSOperationQueue alloc] init];
        [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
         {
             if([data length] > 0 && error == nil) {
                 [self performSelectorOnMainThread:@selector(checkRestServer:) withObject:url.text waitUntilDone:NO];
             }
             else {
                 NSLog(@"rest server not OK");
             }
         }];
        */
        globalServerAddress = url.text;
    }
}

-(void)checkRestServer:(NSString*) url {
    globalServerAddress = url;
}


- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


@end
