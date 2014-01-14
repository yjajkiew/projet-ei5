//
//  BlinkControllerViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "BlinkViewController.h"
#import "ResponseViewController.h"
#import "Arduino.h"
#import "Response.h"

@interface BlinkViewController ()

@end

@implementation BlinkViewController

@synthesize tableView, pinNumberTextField, blinksNumberTextField, delayTextField, arduinos;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.
    arduinos = [[NSMutableArray alloc] init];
    tableView.delegate = self;
    tableView.dataSource = self;
    
    /*
    //json string example
    NSString *jsonString = @"{\"data\":[ {\"id\":\"192.168.2.3\",\"desc\":\"Uno_Projet3\",\"mac\":\"AA:AA:AA:AA:AA:AA\",\"port\":333},  {\"id\":\"192.168.2.5\",\"desc\":\"Uno_Projet5\",\"mac\":\"BB:BB:BB:BB:BB:BB\",\"port\":555} ]}";
    NSData *data = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    */
    
    [self fetchArduinosList];
    
}

-(void)fetchArduinosList {
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
    
    NSLog(@"url: %@", [NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]);
    
    NSOperationQueue *queue = [[NSOperationQueue alloc] init];
    [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
     {
         if([data length] >0 && error == nil) {
             NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
             
             [self performSelectorOnMainThread:@selector(updateUIWithDictionary:) withObject:json waitUntilDone:YES];
             
         }
         else NSLog(@"error request arduino list: %@", error);
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
    return 1;
}

//define number of rows for each section
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if(section == 0) return arduinos.count;
    else return 0;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if(section == 0) return @"Select arduino";
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
    
    return cell;
}

//Action when a cell is selected
- (void) tableView:(UITableView *)table didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    NSLog(@"%@", [NSString stringWithFormat:@"Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
    if ([table isEqual:tableView] && indexPath.section == 0) {
        
    }
}

//send command to REST Server
- (IBAction)sendAction:(id)sender {
    NSString *errorMessage = nil;
    NSIndexPath *indexPath = tableView.indexPathForSelectedRow;
    NSCharacterSet *numericOnly = [NSCharacterSet decimalDigitCharacterSet];
    
    if(!pinNumberTextField.text.length || ![numericOnly isSupersetOfSet:[NSCharacterSet characterSetWithCharactersInString:pinNumberTextField.text]] || [pinNumberTextField.text intValue] < 0 || [pinNumberTextField.text intValue] > 15) errorMessage = @"Pin number must be between 0 and 15";
    else if(!blinksNumberTextField.text.length || ![numericOnly isSupersetOfSet:[NSCharacterSet characterSetWithCharactersInString:blinksNumberTextField.text]] ||[blinksNumberTextField.text intValue] < 0) errorMessage = @"Blinks number must be superior to 0";
    else if(!delayTextField.text.length || ![numericOnly isSupersetOfSet:[NSCharacterSet characterSetWithCharactersInString:delayTextField.text]] || [delayTextField.text intValue] < 0) errorMessage = @"Delay must be superior to 0";
    else if(indexPath == nil) errorMessage = @"You haven't selected an arduino board !";
    
    //error => display alert
    if(errorMessage != nil) {
        UIAlertView *errorAlert = [[UIAlertView alloc] initWithTitle:@"Error"
                                                             message:errorMessage
                                                            delegate:nil
                                                   cancelButtonTitle:@"OK"
                                                   otherButtonTitles:nil];
        [errorAlert show];
    }
    else {
        NSLog(@"%@", [NSString stringWithFormat:@"Button: Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
        Arduino *arduino = [arduinos objectAtIndex:indexPath.row];
        NSString *command = [NSString stringWithFormat:@"%@/arduinos/blink/%@/%@/%@/%@/%@", globalServerAddress, arduino.ip, arduino.ip,pinNumberTextField.text,delayTextField.text,blinksNumberTextField.text];

        // “/arduinos/blink/{idCommande}/{idArduino}/{pin}/{duree}/ {nombre}”
        NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:command]];
        NSOperationQueue *queue = [[NSOperationQueue alloc] init];
        [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
         {
             if([data length] > 0 && error == nil) {
                 NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
                 Response *response = [[Response alloc]initWithJson:[json valueForKey:@"data"]];
                 NSLog(@"response received: %@", response);
                 [self performSelectorOnMainThread:@selector(showResponse:) withObject:response waitUntilDone:YES];
                 
                 
             }
             else NSLog(@"error request arduino list");
         }];

    }

}

-(void)showResponse:(Response*)response {
    [self performSegueWithIdentifier:@"blinkToResponse" sender:response];
}

//change views
-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    //go to chapters' view
    if([segue.identifier isEqualToString:@"blinkToResponse"]) {
        ResponseViewController *responseVC = segue.destinationViewController;
        responseVC.response = (Response*)sender;
    }
}

//hide keyboard when user touches the screen outside of textfields
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    
    if (![[touch view] isKindOfClass:[UITextField class]]) {
        [self.view endEditing:YES];
    }
    [super touchesBegan:touches withEvent:event];
}


- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
